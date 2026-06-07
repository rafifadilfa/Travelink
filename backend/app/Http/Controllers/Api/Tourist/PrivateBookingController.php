<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\Transaction as TransactionModel;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction as MidtransTransaction;

/**
 * Booking Private Trip — wisatawan pilih tour, jumlah peserta, tanggal,
 * lalu bayar langsung via Midtrans Snap.
 *
 * Alur:
 *   POST /api/bookings              → buat Transaction + Booking (status: menunggu_pembayaran)
 *   POST /api/bookings/{id}/payment → buat Snap token Midtrans
 *   GET  /api/bookings/{id}/payment → cek status ke Midtrans, update DB jika lunas
 *   GET  /api/bookings              → daftar semua private booking milik user
 *   GET  /api/bookings/{id}         → detail satu booking
 */
class PrivateBookingController extends Controller
{
    // ================================================================
    // POST /api/bookings
    // Buat booking baru: simpan Transaction + Booking ke DB.
    // Status awal: menunggu_pembayaran (langsung bisa bayar via Midtrans).
    // ================================================================
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tour_id'      => ['required', 'integer', 'exists:tours,id'],
            'participants' => ['required', 'integer', 'min:1', 'max:20'],
            'tour_date'    => ['required', 'date', 'after_or_equal:today'],
        ]);

        $tour = Tour::with('guide')->findOrFail($validated['tour_id']);

        if (! $tour->guide) {
            return response()->json(['message' => 'Tour ini belum memiliki pemandu.'], 422);
        }

        if ($tour->tour_status !== 'published') {
            return response()->json(['message' => 'Tour ini tidak tersedia untuk dipesan.'], 422);
        }

        $totalAmount = $tour->tour_price * $validated['participants'];

        $transaction = TransactionModel::create([
            'user_id'               => Auth::id(),
            'guide_id'              => $tour->guide->id,
            'tour_id'               => $tour->id,
            'participant_count'     => $validated['participants'],
            'price_per_participant' => $tour->tour_price,
            'tour_date'             => $validated['tour_date'],
            'payment_status'        => 'unpaid',
            'total_amount'          => $totalAmount,
        ]);

        $booking = Booking::create([
            'user_id'        => Auth::id(),
            'transaction_id' => $transaction->id,
            'booking_status' => Booking::STATUS_MENUNGGU_PEMBAYARAN,
        ]);

        return response()->json([
            'message'          => 'Booking berhasil dibuat. Silakan lanjutkan pembayaran.',
            'booking_id'       => $booking->id,
            'transaction_code' => $transaction->transaction_code,
            'total_amount'     => (int) $totalAmount,
        ], 201);
    }

    // ================================================================
    // GET /api/bookings
    // Daftar semua private booking milik user yang sedang login.
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with([
                'transaction.tour.images',
                'transaction.tour.location',
                'transaction.tour.guide',
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $bookings->map(fn($b) => $this->formatBooking($b)),
        ]);
    }

    // ================================================================
    // GET /api/bookings/{id}
    // Detail satu booking milik user yang sedang login.
    // ================================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->with([
                'transaction.tour.images',
                'transaction.tour.location',
                'transaction.tour.guide',
            ])
            ->findOrFail($id);

        return response()->json(['booking' => $this->formatBooking($booking)]);
    }

    // ================================================================
    // POST /api/bookings/{id}/payment
    // Buat Midtrans Snap token untuk pembayaran booking ini.
    // Hanya bisa dipanggil saat booking masih menunggu_pembayaran dan belum lunas.
    // ================================================================
    public function createPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', Auth::id())
            ->whereIn('booking_status', [
                Booking::STATUS_MENUNGGU_PEMBAYARAN,
            ])
            ->with('transaction.tour')
            ->findOrFail($id);

        $transaction = $booking->transaction;

        if ($transaction->payment_status === 'paid') {
            return response()->json(['message' => 'Pembayaran sudah lunas.'], 422);
        }

        // Generate order ID unik per percobaan bayar
        $orderId = 'PT-' . $booking->id . '-' . now()->timestamp;

        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized  = true;
        MidtransConfig::$is3ds        = true;

        $user = Auth::user();

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => (int) $transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
            ],
            'item_details' => [
                [
                    'id'       => 'TOUR-' . $transaction->tour_id,
                    'price'    => (int) $transaction->price_per_participant,
                    'quantity' => $transaction->participant_count,
                    'name'     => $transaction->tour->name,
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat transaksi Midtrans: ' . $e->getMessage(),
            ], 500);
        }

        $transaction->update(['midtrans_order_id' => $orderId]);

        return response()->json([
            'snap_token'   => $snapToken,
            'order_id'     => $orderId,
            'total_amount' => (int) $transaction->total_amount,
        ]);
    }

    // ================================================================
    // GET /api/bookings/{id}/payment
    // Cek status pembayaran ke Midtrans. Jika sudah lunas, update DB
    // dan kredit saldo pemandu (escrow). Bisa di-poll dari frontend.
    // ================================================================
    public function checkPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', Auth::id())
            ->with(['transaction.tour.guide'])
            ->findOrFail($id);

        $transaction = $booking->transaction;

        // Belum pernah buat token Midtrans
        if (! $transaction->midtrans_order_id) {
            return response()->json([
                'payment_status' => $transaction->payment_status,
                'booking_status' => $booking->booking_status,
            ]);
        }

        // Sudah terbayar di DB — kembalikan langsung tanpa tanya Midtrans
        if ($transaction->payment_status === 'paid') {
            return response()->json([
                'payment_status' => 'paid',
                'booking_status' => $booking->booking_status,
            ]);
        }

        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');

        try {
            $status      = MidtransTransaction::status($transaction->midtrans_order_id);
            $txStatus    = $status->transaction_status ?? '';
            $fraudStatus = $status->fraud_status ?? '';

            $isPaid = ($txStatus === 'settlement') ||
                      ($txStatus === 'capture' && $fraudStatus === 'accept');

            if ($isPaid) {
                $transaction->update(['payment_status' => 'paid']);
                $booking->update([
                    'booking_status' => Booking::STATUS_TERKONFIRMASI,
                    'paid_at'        => now(),
                ]);

                // Kredit saldo pending pemandu (escrow — dicairkan saat trip selesai)
                $guide = $transaction->tour?->guide;
                if ($guide) {
                    WalletService::creditPending($guide, (float) $transaction->total_amount);
                }
            }
        } catch (\Exception) {
            // Midtrans belum punya record (order baru dibuat, belum ada aksi bayar)
            // Kembalikan status saat ini tanpa ubah apa pun
        }

        return response()->json([
            'payment_status' => $transaction->payment_status,
            'booking_status' => $booking->fresh()->booking_status,
        ]);
    }

    // ----------------------------------------------------------------
    // Helper: format satu booking untuk response JSON
    // ----------------------------------------------------------------
    private function formatBooking(Booking $booking): array
    {
        $transaction = $booking->transaction;
        $host        = request()->getSchemeAndHttpHost();
        $tour        = $transaction?->tour;
        $firstImage  = $tour?->images?->first();

        return [
            'id'             => $booking->id,
            'booking_status' => $booking->booking_status,
            'paid_at'        => $booking->paid_at?->toIso8601String(),
            'created_at'     => $booking->created_at?->toIso8601String(),
            'transaction'    => $transaction ? [
                'id'                    => $transaction->id,
                'transaction_code'      => $transaction->transaction_code,
                'tour_date'             => $transaction->tour_date instanceof \Carbon\Carbon
                    ? $transaction->tour_date->format('Y-m-d')
                    : $transaction->tour_date,
                'participant_count'     => $transaction->participant_count,
                'price_per_participant' => (int) $transaction->price_per_participant,
                'total_amount'          => (int) $transaction->total_amount,
                'payment_status'        => $transaction->payment_status,
                'tour'                  => $tour ? [
                    'id'        => $tour->id,
                    'name'      => $tour->name,
                    'location'  => $tour->location?->name ?? '-',
                    'image_url' => $firstImage
                        ? ($host . '/storage/' . $firstImage->image_path)
                        : null,
                    'guide'     => $tour->guide ? [
                        'id'   => $tour->guide->id,
                        'name' => $tour->guide->name,
                    ] : null,
                ] : null,
            ] : null,
        ];
    }
}

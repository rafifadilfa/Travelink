<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\Transaction as TransactionModel;
use App\Services\NotificationService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction as MidtransTransaction;

// Private Trip: buat booking, bayar via Midtrans Snap, cek status pembayaran.
class PrivateBookingController extends Controller
{
    // POST /api/bookings — buat Transaction + Booking, status awal: menunggu_pembayaran
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
            'booking_status' => Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
        ]);

        // Notifikasi pemandu: ada pesanan baru masuk
        NotificationService::send(
            'new_booking_request',
            'guide',
            $tour->guide->id,
            'Pesanan Baru Masuk',
            "Ada wisatawan yang memesan \"{$tour->name}\" untuk {$validated['participants']} peserta. Silakan konfirmasi atau tolak pesanan.",
            ['booking_id' => $booking->id]
        );

        return response()->json([
            'message'          => 'Booking berhasil dibuat. Silakan lanjutkan pembayaran.',
            'booking_id'       => $booking->id,
            'transaction_code' => $transaction->transaction_code,
            'total_amount'     => (int) $totalAmount,
        ], 201);
    }

    // GET /api/bookings — daftar private booking milik user
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

    // GET /api/bookings/{id} — detail satu booking milik user
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

    // POST /api/bookings/{id}/payment — buat Midtrans Snap token, hanya saat menunggu_pembayaran
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

        // Timestamp di order_id mencegah duplikat di Midtrans
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

    // GET /api/bookings/{id}/payment — cek status ke Midtrans, kredit escrow jika lunas (bisa di-poll)
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

                // Kredit pending_balance guide (escrow — dicairkan saat trip selesai)
                $guide = $transaction->tour?->guide;
                if ($guide) {
                    WalletService::creditPending($guide, (float) $transaction->total_amount);
                }

                // Notifikasi hanya dari polling ini (jika webhook aktif, notif sudah dikirim di MidtransCallbackController)
                $tourName = $transaction->tour?->name ?? 'paket wisata';
                NotificationService::send(
                    'payment_confirmed',
                    'user',
                    $request->user()->id,
                    'Pembayaran Dikonfirmasi',
                    "Pembayaran untuk \"{$tourName}\" berhasil. Booking Anda terkonfirmasi.",
                    ['booking_id' => $booking->id]
                );
                if ($guide) {
                    NotificationService::send(
                        'new_payment_received',
                        'guide',
                        $guide->id,
                        'Pembayaran Diterima',
                        "Wisatawan telah menyelesaikan pembayaran untuk \"{$tourName}\".",
                        ['booking_id' => $booking->id]
                    );
                }
            }
        } catch (\Exception) {
            // Midtrans belum punya record — order baru, belum ada aksi bayar
        }

        return response()->json([
            'payment_status' => $transaction->payment_status,
            'booking_status' => $booking->fresh()->booking_status,
        ]);
    }

    // POST /api/bookings/{id}/cancel — TC-031: cancel booking yang masih menunggu konfirmasi pemandu
    public function cancel(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('user_id', Auth::id())
            ->where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->findOrFail($id);

        $booking->update([
            'booking_status'    => Booking::STATUS_DIBATALKAN,
            'cancelation_reason' => 'Dibatalkan oleh wisatawan.',
        ]);

        // Notifikasi pemandu: wisatawan membatalkan pesanan
        $booking->load(['transaction.tour.guide']);
        $guide    = $booking->transaction?->tour?->guide;
        $tourName = $booking->transaction?->tour?->name ?? 'paket wisata';
        if ($guide) {
            NotificationService::send(
                'booking_cancelled_by_tourist',
                'guide',
                $guide->id,
                'Pesanan Dibatalkan Wisatawan',
                "Wisatawan membatalkan pesanan untuk \"{$tourName}\".",
                ['booking_id' => $booking->id]
            );
        }

        return response()->json([
            'message' => 'Booking berhasil dibatalkan.',
            'booking' => $this->formatBooking($booking->fresh()->load([
                'transaction.tour.images',
                'transaction.tour.location',
                'transaction.tour.guide',
            ])),
        ], 200);
    }

    // Helper: format booking untuk response
    private function formatBooking(Booking $booking): array
    {
        $transaction = $booking->transaction;
        $host        = request()->getSchemeAndHttpHost();
        $tour        = $transaction?->tour;
        $firstImage  = $tour?->images?->first();

        return [
            'id'             => $booking->id,
            'booking_status' => $booking->booking_status,
            'guide_reviewed' => (bool) $booking->guide_reviewed,
            'tour_reviewed'  => (bool) $booking->tour_reviewed,
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

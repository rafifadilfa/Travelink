<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Booking;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Verifikasi pembayaran oleh admin (UC-18).
 * Dilindungi EnsureIsAdmin.
 */
class AdminPaymentApiController extends Controller
{
    // ----------------------------------------------------------------
    // Helper: format booking untuk response
    // ----------------------------------------------------------------
    private function formatBooking(Booking $booking): array
    {
        $transaction = $booking->transaction;
        $host        = request()->getSchemeAndHttpHost();

        return [
            'id'                   => $booking->id,
            'booking_status'       => $booking->booking_status,
            'payment_proof_url'    => $booking->payment_proof_path
                ? $host . '/storage/' . $booking->payment_proof_path : null,
            'paid_at'              => $booking->paid_at,
            'payment_verified_at'  => $booking->payment_verified_at,
            'created_at'           => $booking->created_at,
            'transaction' => $transaction ? [
                'id'                => $transaction->id,
                'transaction_code'  => $transaction->transaction_code,
                'tour_date'         => $transaction->tour_date,
                'participant_count' => $transaction->participant_count,
                'total_amount'      => (float) $transaction->total_amount,
                'payment_status'    => $transaction->payment_status,
                'tour' => $transaction->tour ? [
                    'id'   => $transaction->tour->id,
                    'name' => $transaction->tour->name,
                ] : null,
                'user' => $transaction->user ? [
                    'id'    => $transaction->user->id,
                    'name'  => $transaction->user->name,
                    'email' => $transaction->user->email,
                ] : null,
                'guide' => $transaction->guide ? [
                    'id'    => $transaction->guide->id,
                    'name'  => $transaction->guide->name,
                    'email' => $transaction->guide->email,
                ] : null,
            ] : null,
        ];
    }

    // ================================================================
    // GET /api/admin/payments
    // Daftar pesanan menunggu_verifikasi_pembayaran
    // UC-18: Memverifikasi Pembayaran
    // ================================================================
    public function index(): JsonResponse
    {
        $bookings = Booking::where('booking_status', Booking::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN)
            ->with(['transaction.tour', 'transaction.user', 'transaction.guide'])
            ->orderBy('paid_at', 'asc') // paling lama menunggu ditampilkan dulu
            ->paginate(20);

        return response()->json([
            'data' => collect($bookings->items())->map(fn($b) => $this->formatBooking($b)),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'total'        => $bookings->total(),
            ],
        ], 200);
    }

    // ================================================================
    // GET /api/admin/payments/{id}
    // Detail satu pesanan + URL bukti pembayaran
    // ================================================================
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['transaction.tour', 'transaction.user', 'transaction.guide'])
            ->findOrFail($id);

        return response()->json(['booking' => $this->formatBooking($booking)], 200);
    }

    // ================================================================
    // POST /api/admin/payments/{id}/verify
    // Admin memverifikasi bukti pembayaran (UC-18 Normal Flow)
    // menunggu_verifikasi_pembayaran → terkonfirmasi
    // Efek: WalletService::creditPending() (pending_balance guide +)
    // ================================================================
    public function verify(Request $request, int $id): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user();

        $booking = Booking::where('booking_status', Booking::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN)
            ->with('transaction.guide')
            ->findOrFail($id);

        $transaction = $booking->transaction;
        $guide       = $transaction->guide;

        $booking->update([
            'booking_status'      => Booking::STATUS_TERKONFIRMASI,
            'payment_verified_at' => now(),
            'payment_verified_by' => $admin->id,
        ]);

        $transaction->update(['payment_status' => 'paid']);

        // Tambah pending_balance pemandu (WalletService — satu-satunya sumber kebenaran)
        WalletService::creditPending($guide, $transaction->total_amount);

        // TODO: notifikasi wisatawan & pemandu (out of scope)

        $booking->load(['transaction.tour', 'transaction.user', 'transaction.guide']);

        return response()->json([
            'message' => 'Pembayaran berhasil diverifikasi. Pesanan sekarang berstatus Terkonfirmasi.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }

    // ================================================================
    // POST /api/admin/payments/{id}/reject
    // Bukti tidak valid (UC-18 Alternate Flow A1)
    // terkonfirmasi → menunggu_pembayaran (wisatawan perlu upload ulang)
    // ================================================================
    public function rejectPayment(Request $request, int $id): JsonResponse
    {
        $booking = Booking::where('booking_status', Booking::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN)
            ->findOrFail($id);

        // Kembalikan ke menunggu_pembayaran agar wisatawan bisa upload ulang
        $booking->update([
            'booking_status'    => Booking::STATUS_MENUNGGU_PEMBAYARAN,
            'payment_proof_path' => null,
            'paid_at'           => null,
        ]);

        // TODO: notifikasi wisatawan (out of scope)

        $booking->load(['transaction.tour', 'transaction.user', 'transaction.guide']);

        return response()->json([
            'message' => 'Bukti pembayaran ditolak. Wisatawan perlu mengunggah ulang bukti pembayaran.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }
}

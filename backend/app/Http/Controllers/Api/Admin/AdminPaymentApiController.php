<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Booking;
use App\Services\NotificationService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Verifikasi pembayaran oleh admin (UC-18).
 * Dilindungi EnsureIsAdmin.
 */
class AdminPaymentApiController extends Controller
{
    // Helper: format booking untuk response
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

    // GET /api/admin/payments — UC-18: daftar pesanan menunggu_verifikasi_pembayaran
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

    // GET /api/admin/payments/{id} — detail pesanan + URL bukti pembayaran
    public function show(int $id): JsonResponse
    {
        $booking = Booking::with(['transaction.tour', 'transaction.user', 'transaction.guide'])
            ->findOrFail($id);

        return response()->json(['booking' => $this->formatBooking($booking)], 200);
    }

    // POST /api/admin/payments/{id}/verify — UC-18: verifikasi → terkonfirmasi, creditPending guide
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

        // WalletService adalah satu-satunya yang boleh ubah saldo
        WalletService::creditPending($guide, $transaction->total_amount);

        $tourName = $transaction->tour?->name ?? 'paket wisata';
        $userId   = $transaction->user?->id;
        $guideId  = $guide->id;

        if ($userId) {
            NotificationService::send(
                'payment_verified',
                'user',
                $userId,
                'Pembayaran Dikonfirmasi',
                "Pembayaran Anda untuk {$tourName} telah diverifikasi. Selamat menikmati perjalanan!",
                ['booking_id' => $booking->id]
            );
        }

        NotificationService::send(
            'payment_verified',
            'guide',
            $guideId,
            'Pembayaran Dikonfirmasi',
            "Pembayaran untuk booking {$tourName} oleh {$transaction->user?->name} telah dikonfirmasi.",
            ['booking_id' => $booking->id]
        );

        $booking->load(['transaction.tour', 'transaction.user', 'transaction.guide']);

        return response()->json([
            'message' => 'Pembayaran berhasil diverifikasi. Pesanan sekarang berstatus Terkonfirmasi.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }

    // POST /api/admin/payments/{id}/reject — UC-18 A1: bukti tidak valid → menunggu_pembayaran
    public function rejectPayment(int $id): JsonResponse
    {
        $booking = Booking::where('booking_status', Booking::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN)
            ->findOrFail($id);

        $booking->update([
            'booking_status'    => Booking::STATUS_MENUNGGU_PEMBAYARAN,
            'payment_proof_path' => null,
            'paid_at'           => null,
        ]);

        $booking->load(['transaction.tour', 'transaction.user', 'transaction.guide']);

        $tourName = $booking->transaction?->tour?->name ?? 'paket wisata';
        $userId   = $booking->transaction?->user?->id;

        if ($userId) {
            NotificationService::send(
                'payment_rejected',
                'user',
                $userId,
                'Bukti Pembayaran Ditolak',
                "Bukti pembayaran untuk {$tourName} tidak valid. Silakan upload ulang bukti pembayaran.",
                ['booking_id' => $booking->id]
            );
        }

        return response()->json([
            'message' => 'Bukti pembayaran ditolak. Wisatawan perlu mengunggah ulang bukti pembayaran.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }
}

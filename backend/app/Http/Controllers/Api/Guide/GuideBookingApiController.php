<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Manajemen pesanan masuk pemandu (UC-21 daftar & detail, UC-15 terima/tolak).
 * Semua endpoint dilindungi EnsureGuideIsVerified.
 */
class GuideBookingApiController extends Controller
{
    // ----------------------------------------------------------------
    // Helper: format satu booking untuk response
    // ----------------------------------------------------------------
    private function formatBooking(Booking $booking): array
    {
        $transaction = $booking->transaction;
        $host        = request()->getSchemeAndHttpHost();

        return [
            'id'                      => $booking->id,
            'booking_status'          => $booking->booking_status,
            'tour_reviewed'           => $booking->tour_reviewed,
            'guide_reviewed'          => $booking->guide_reviewed,
            'cancelation_reason'      => $booking->cancelation_reason,
            'payment_proof_url'       => $booking->payment_proof_path
                ? $host . '/storage/' . $booking->payment_proof_path : null,
            'paid_at'                 => $booking->paid_at,
            'payment_verified_at'     => $booking->payment_verified_at,
            'created_at'              => $booking->created_at,
            'transaction' => $transaction ? [
                'id'                => $transaction->id,
                'transaction_code'  => $transaction->transaction_code,
                'tour_date'         => $transaction->tour_date,
                'participant_count' => $transaction->participant_count,
                'total_amount'      => $transaction->total_amount,
                'payment_status'    => $transaction->payment_status,
                'tour' => $transaction->tour ? [
                    'id'   => $transaction->tour->id,
                    'name' => $transaction->tour->name,
                ] : null,
                'user' => $transaction->user ? [
                    'id'    => $transaction->user->id,
                    'name'  => $transaction->user->name,
                    'email' => $transaction->user->email,
                    'avatar_url' => $transaction->user->profile_photo_path
                        ? $host . '/storage/' . $transaction->user->profile_photo_path : null,
                ] : null,
            ] : null,
        ];
    }

    // ================================================================
    // GET /api/guide/bookings
    // Query: tab=active|history (default: active), page=1
    // UC-21: Melihat & Mengelola Pesanan Masuk
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();
        $tab   = $request->get('tab', 'active');

        $query = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->with(['transaction.tour', 'transaction.user'])
            ->orderBy('created_at', 'desc');

        if ($tab === 'history') {
            // Riwayat: status terminal
            $query->whereIn('booking_status', Booking::TERMINAL_STATUSES);
        } else {
            // Aktif: semua status yang masih berjalan
            $query->whereIn('booking_status', Booking::ACTIVE_STATUSES);
        }

        $bookings = $query->paginate(15);

        return response()->json([
            'tab'      => $tab,
            'data'     => collect($bookings->items())->map(fn($b) => $this->formatBooking($b)),
            'meta'     => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'total'        => $bookings->total(),
            ],
        ], 200);
    }

    // ================================================================
    // GET /api/guide/bookings/{id}
    // Detail satu pesanan — dipakai halaman detail sebelum terima/tolak
    // ================================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $booking = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->with(['transaction.tour', 'transaction.user'])
            ->findOrFail($id);

        return response()->json(['booking' => $this->formatBooking($booking)], 200);
    }

    // ================================================================
    // POST /api/guide/bookings/{id}/accept
    // UC-15 Normal Flow: pemandu menerima pesanan
    // menunggu_konfirmasi_pemandu → menunggu_pembayaran
    // ================================================================
    public function accept(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $booking = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->findOrFail($id);

        $booking->update(['booking_status' => Booking::STATUS_MENUNGGU_PEMBAYARAN]);

        // TODO: notifikasi wisatawan (out of scope)

        $booking->load(['transaction.tour', 'transaction.user']);

        return response()->json([
            'message' => 'Pesanan berhasil diterima. Wisatawan akan diminta melakukan pembayaran.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }

    // ================================================================
    // POST /api/guide/bookings/{id}/reject
    // UC-15 Alternate Flow A1: pemandu menolak pesanan
    // menunggu_konfirmasi_pemandu → ditolak
    // ================================================================
    public function reject(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $booking = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->findOrFail($id);

        $booking->update([
            'booking_status'     => Booking::STATUS_DITOLAK,
            'cancelation_reason' => $validated['rejection_reason'],
        ]);

        // TODO: notifikasi wisatawan (out of scope)

        $booking->load(['transaction.tour', 'transaction.user']);

        return response()->json([
            'message' => 'Pesanan ditolak.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }
}

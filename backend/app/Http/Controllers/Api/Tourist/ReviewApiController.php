<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\GuideReview;
use App\Models\OpenTripParticipant;
use App\Models\TourReview;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Endpoint rating/ulasan guide oleh wisatawan (UC-09).
 * Berlaku untuk Private Booking maupun Smart Open Trip.
 */
class ReviewApiController extends Controller
{
    // ================================================================
    // POST /api/reviews/guide
    // Submit rating & komentar ke pemandu setelah trip selesai.
    // Wajib login sebagai wisatawan (auth:sanctum).
    // Body: { transaction_id? | participant_id?, rating: 1-5, comment?: string }
    // ================================================================
    public function submitGuideReview(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['nullable', 'integer', 'exists:transactions,id'],
            'participant_id' => ['nullable', 'integer', 'exists:open_trip_participants,id'],
            'rating'         => ['required', 'integer', 'min:1', 'max:5'],
            'comment'        => ['nullable', 'string', 'max:1000'],
        ]);

        $txId   = $request->filled('transaction_id') ? $request->integer('transaction_id') : null;
        $partId = $request->filled('participant_id')  ? $request->integer('participant_id')  : null;

        if (! $txId && ! $partId) {
            return response()->json(['message' => 'Harap sertakan transaction_id (booking private) atau participant_id (open trip).'], 422);
        }

        if ($txId && $partId) {
            return response()->json(['message' => 'Harap sertakan salah satu saja: transaction_id atau participant_id.'], 422);
        }

        return $txId
            ? $this->submitForPrivateBooking($request, Auth::id(), $txId)
            : $this->submitForOpenTrip($request, Auth::id(), $partId);
    }

    // ================================================================
    // GET /api/reviews/status
    // Cek apakah user sudah review untuk booking/peserta tertentu.
    // Query: ?transaction_id=X  ATAU  ?participant_id=X
    // ================================================================
    public function reviewStatus(Request $request): JsonResponse
    {
        $userId = Auth::id();

        if ($request->filled('transaction_id')) {
            $txId   = $request->integer('transaction_id');
            $booking = Booking::where('user_id', $userId)
                ->whereHas('transaction', fn($q) => $q->where('id', $txId))
                ->first();

            $reviewed = (bool) ($booking?->guide_reviewed ?? false);
            return response()->json([
                'reviewed' => $reviewed,
                'review'   => $reviewed
                    ? GuideReview::where('user_id', $userId)
                        ->where('transaction_id', $txId)
                        ->select(['rating', 'comment', 'created_at'])
                        ->first()
                    : null,
            ]);
        }

        if ($request->filled('participant_id')) {
            $partId      = $request->integer('participant_id');
            $participant = OpenTripParticipant::where('id', $partId)
                ->where('user_id', $userId)
                ->first();

            $reviewed = (bool) ($participant?->guide_reviewed ?? false);
            return response()->json([
                'reviewed' => $reviewed,
                'review'   => $reviewed
                    ? GuideReview::where('user_id', $userId)
                        ->where('participant_id', $partId)
                        ->select(['rating', 'comment', 'created_at'])
                        ->first()
                    : null,
            ]);
        }

        return response()->json(['message' => 'Harap sertakan transaction_id atau participant_id.'], 422);
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    // ================================================================
    // POST /api/reviews/tour
    // Submit rating untuk paket wisata setelah trip selesai.
    // Hanya untuk Private Booking. Auth: wisatawan (auth:sanctum).
    // Body: { transaction_id: int, rating: 1-5, comment?: string }
    // ================================================================
    public function submitTourReview(Request $request): JsonResponse
    {
        $request->validate([
            'transaction_id' => ['required', 'integer', 'exists:transactions,id'],
            'rating'         => ['required', 'integer', 'min:1', 'max:5'],
            'comment'        => ['nullable', 'string', 'max:1000'],
        ]);

        $userId = Auth::id();
        $txId   = $request->integer('transaction_id');

        $booking = Booking::where('user_id', $userId)
            ->whereHas('transaction', fn($q) => $q->where('id', $txId))
            ->with(['transaction.tour'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        $transaction = $booking->transaction;

        if ($transaction->payment_status !== 'paid') {
            return response()->json(['message' => 'Pembayaran belum selesai.'], 403);
        }

        $tourDate = $transaction->tour_date instanceof Carbon
            ? $transaction->tour_date
            : Carbon::parse($transaction->tour_date);

        if (! $tourDate->isPast() || $tourDate->isToday()) {
            return response()->json(['message' => 'Trip belum selesai. Ulasan hanya bisa dikirim setelah tanggal trip lewat.'], 403);
        }

        if ($booking->tour_reviewed) {
            return response()->json(['message' => 'Kamu sudah memberikan ulasan untuk paket ini.'], 409);
        }

        $tourId = $transaction->tour_id;
        if (! $tourId) {
            return response()->json(['message' => 'Paket wisata tidak ditemukan untuk trip ini.'], 422);
        }

        $review = TourReview::create([
            'transaction_id' => $transaction->id,
            'tour_id'        => $tourId,
            'user_id'        => $userId,
            'rating'         => $request->integer('rating'),
            'comment'        => $request->input('comment'),
        ]);

        $booking->update(['tour_reviewed' => true]);

        return response()->json([
            'message' => 'Ulasan paket wisata berhasil dikirim. Terima kasih!',
            'review'  => [
                'id'         => $review->id,
                'tour_id'    => $review->tour_id,
                'rating'     => $review->rating,
                'comment'    => $review->comment,
                'created_at' => $review->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    private function submitForPrivateBooking(Request $request, int $userId, int $txId): JsonResponse
    {
        $booking = Booking::where('user_id', $userId)
            ->whereHas('transaction', fn($q) => $q->where('id', $txId))
            ->with(['transaction.tour.guide'])
            ->first();

        if (! $booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        $transaction = $booking->transaction;

        // Validasi: sudah bayar
        if ($transaction->payment_status !== 'paid') {
            return response()->json(['message' => 'Pembayaran belum selesai.'], 403);
        }

        // Validasi: tanggal trip sudah lewat (hari ini belum dianggap selesai)
        $tourDate = $transaction->tour_date instanceof Carbon
            ? $transaction->tour_date
            : Carbon::parse($transaction->tour_date);

        if (! $tourDate->isPast() || $tourDate->isToday()) {
            return response()->json(['message' => 'Trip belum selesai. Ulasan hanya bisa dikirim setelah tanggal trip lewat.'], 403);
        }

        // Validasi: belum review
        if ($booking->guide_reviewed) {
            return response()->json(['message' => 'Kamu sudah memberikan ulasan untuk trip ini.'], 409);
        }

        $guideId = $transaction->guide_id ?? $transaction->tour?->guide?->id;
        if (! $guideId) {
            return response()->json(['message' => 'Pemandu tidak ditemukan untuk trip ini.'], 422);
        }

        GuideReview::create([
            'user_id'        => $userId,
            'guide_id'       => $guideId,
            'transaction_id' => $transaction->id,
            'participant_id' => null,
            'rating'         => $request->integer('rating'),
            'comment'        => $request->input('comment'),
        ]);

        $booking->update(['guide_reviewed' => true]);

        return response()->json(['message' => 'Ulasan berhasil dikirim. Terima kasih!'], 201);
    }

    private function submitForOpenTrip(Request $request, int $userId, int $partId): JsonResponse
    {
        $participant = OpenTripParticipant::where('id', $partId)
            ->where('user_id', $userId)
            ->with(['tour.guide'])
            ->first();

        if (! $participant) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan.'], 404);
        }

        // Validasi: sudah masuk grup
        if ($participant->status !== 'matched') {
            return response()->json(['message' => 'Trip ini belum terbentuk grup.'], 403);
        }

        // Validasi: sudah bayar
        if ($participant->payment_status !== 'paid') {
            return response()->json(['message' => 'Pembayaran belum selesai.'], 403);
        }

        // Validasi: tanggal trip sudah lewat
        $tripDate = $participant->trip_date instanceof Carbon
            ? $participant->trip_date
            : Carbon::parse($participant->trip_date);

        if (! $tripDate->isPast() || $tripDate->isToday()) {
            return response()->json(['message' => 'Trip belum selesai. Ulasan hanya bisa dikirim setelah tanggal trip lewat.'], 403);
        }

        // Validasi: belum review
        if ($participant->guide_reviewed) {
            return response()->json(['message' => 'Kamu sudah memberikan ulasan untuk trip ini.'], 409);
        }

        $guideId = $participant->tour?->guide?->id;
        if (! $guideId) {
            return response()->json(['message' => 'Pemandu tidak ditemukan untuk trip ini.'], 422);
        }

        GuideReview::create([
            'user_id'        => $userId,
            'guide_id'       => $guideId,
            'transaction_id' => null,
            'participant_id' => $participant->id,
            'rating'         => $request->integer('rating'),
            'comment'        => $request->input('comment'),
        ]);

        $participant->update(['guide_reviewed' => true]);

        return response()->json(['message' => 'Ulasan berhasil dikirim. Terima kasih!'], 201);
    }
}

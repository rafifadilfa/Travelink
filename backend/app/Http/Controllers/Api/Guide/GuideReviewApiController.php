<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\GuideReview;
use App\Models\TourReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Melihat ringkasan & daftar ulasan pemandu (UC-16).
 * Menggabungkan ulasan pemandu (guide_reviews) dan ulasan paket (tour_reviews).
 * Dilindungi EnsureGuideIsVerified.
 */
class GuideReviewApiController extends Controller
{
    // ================================================================
    // GET /api/guide/reviews
    // Query: rating=1-5 (filter), period=month|3months|year (filter)
    // UC-16: Melihat Ulasan & Rating
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();
        $host  = $request->getSchemeAndHttpHost();

        // Periode filter
        $since = null;
        if ($request->filled('period')) {
            $since = match ($request->get('period')) {
                'month'   => now()->subMonth(),
                '3months' => now()->subMonths(3),
                'year'    => now()->subYear(),
                default   => null,
            };
        }

        // ─── Ulasan Pemandu (guide_reviews) ─────────────────────────────
        $guideQuery = GuideReview::where('guide_id', $guide->id)
            ->with('user:id,name,profile_photo_path');

        if ($request->filled('rating')) {
            $guideQuery->where('rating', (int) $request->get('rating'));
        }
        if ($since) {
            $guideQuery->where('created_at', '>=', $since);
        }

        $guideReviews = $guideQuery->get()->map(fn($r) => [
            'type'       => 'guide',
            'id'         => 'g_' . $r->id,
            'rating'     => $r->rating,
            'comment'    => $r->comment,
            'tour_name'  => null,
            'created_at' => $r->created_at,
            'user' => $r->user ? [
                'id'         => $r->user->id,
                'name'       => $r->user->name,
                'avatar_url' => $r->user->profile_photo_path
                    ? $host . '/storage/' . $r->user->profile_photo_path : null,
            ] : null,
        ]);

        // ─── Ulasan Paket (tour_reviews via tour.tour_guide_id) ─────────
        $tourQuery = TourReview::whereHas('tour', fn($q) => $q->where('tour_guide_id', $guide->id))
            ->with(['user:id,name,profile_photo_path', 'tour:id,name']);

        if ($request->filled('rating')) {
            $tourQuery->where('rating', (int) $request->get('rating'));
        }
        if ($since) {
            $tourQuery->where('created_at', '>=', $since);
        }

        $tourReviews = $tourQuery->get()->map(fn($r) => [
            'type'       => 'tour',
            'id'         => 't_' . $r->id,
            'rating'     => $r->rating,
            'comment'    => $r->comment,
            'tour_name'  => $r->tour?->name,
            'created_at' => $r->created_at,
            'user' => $r->user ? [
                'id'         => $r->user->id,
                'name'       => $r->user->name,
                'avatar_url' => $r->user->profile_photo_path
                    ? $host . '/storage/' . $r->user->profile_photo_path : null,
            ] : null,
        ]);

        // ─── Gabungkan + sort by created_at DESC ────────────────────────
        $combined = $guideReviews->concat($tourReviews)
            ->sortByDesc('created_at')
            ->values();

        // ─── Distribusi rating (guide_reviews saja, semua waktu) ─────────
        $allRatings = GuideReview::where('guide_id', $guide->id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = (int) ($allRatings[$i] ?? 0);
        }

        return response()->json([
            'summary' => [
                'average_rating' => round((float) $guide->rating, 1),
                'total_reviews'  => (int) $guide->reviews()->count(),
                'distribution'   => $distribution,
            ],
            'data' => $combined,
            'meta' => [
                'current_page' => 1,
                'last_page'    => 1,
                'total'        => $combined->count(),
            ],
        ]);
    }
}

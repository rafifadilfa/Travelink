<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\GuideReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Melihat ringkasan & daftar ulasan pemandu (UC-16).
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

        $query = GuideReview::where('guide_id', $guide->id)
            ->with('user:id,name,profile_photo_path')
            ->orderBy('created_at', 'desc');

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->get('rating'));
        }

        // Filter by period
        if ($request->filled('period')) {
            $period = $request->get('period');
            $since  = match ($period) {
                'month'   => now()->subMonth(),
                '3months' => now()->subMonths(3),
                'year'    => now()->subYear(),
                default   => null,
            };
            if ($since) {
                $query->where('created_at', '>=', $since);
            }
        }

        $reviews = $query->paginate(10);

        // Distribusi rating (1–5) untuk keseluruhan guide, bukan hanya yang difilter
        $allRatings = GuideReview::where('guide_id', $guide->id)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = (int) ($allRatings[$i] ?? 0);
        }

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'summary' => [
                'average_rating' => round((float) $guide->rating, 1),
                'total_reviews'  => (int) $guide->reviews()->count(),
                'distribution'   => $distribution,
            ],
            'data' => collect($reviews->items())->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at,
                'user' => $r->user ? [
                    'id'         => $r->user->id,
                    'name'       => $r->user->name,
                    'avatar_url' => $r->user->profile_photo_path
                        ? $host . '/storage/' . $r->user->profile_photo_path : null,
                ] : null,
            ]),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
        ], 200);
    }
}

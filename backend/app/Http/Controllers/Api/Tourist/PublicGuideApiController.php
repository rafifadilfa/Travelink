<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicGuideApiController extends Controller
{
    // GET /api/guides?limit=6
    public function index(Request $request): JsonResponse
    {
        $limit = min($request->integer('limit', 6), 20);

        $guides = Guide::with(['specialities'])
            ->where('verification_status', 'verified')
            ->where('rating', '>', 0)
            ->orderByDesc('rating')
            ->limit($limit)
            ->get()
            ->map(fn(Guide $g) => [
                'id'          => $g->id,
                'name'        => $g->name,
                'avatar'      => $g->profile_picture,
                'location'    => $g->country?->country_name ?? 'Indonesia',
                'rating'      => (float) ($g->rating ?? 0),
                'total_tours' => $g->tours()->count(),
                'specialty'   => $g->specialities->first()?->name,
            ]);

        return response()->json(['data' => $guides]);
    }

    // GET /api/guides/{id}
    public function show(Request $request, int $id): JsonResponse
    {
        $guide = Guide::with([
            'specialities',
            'languages',
            'country',
            'tours' => fn($q) => $q->where('tour_status', 'published')
                                   ->with(['images', 'categories']),
        ])
            ->where('verification_status', 'verified')
            ->findOrFail($id);

        $host = $request->getSchemeAndHttpHost();

        $tours = $guide->tours->map(fn($tour) => [
            'id'           => $tour->id,
            'name'         => $tour->name,
            'description'  => $tour->tour_description,
            'price'        => (int) ($tour->tour_price ?? 0),
            'duration'     => $tour->tour_duration,
            'is_open_trip' => (bool) $tour->is_open_trip,
            'rating'       => (float) ($tour->tour_rating ?? 0),
            'image_url'    => $this->resolveImageUrl($tour->images->first()?->image_path, $host),
            'categories'   => $tour->categories->pluck('name')->values(),
        ])->values();

        return response()->json([
            'guide' => [
                'id'            => $guide->id,
                'name'          => $guide->name,
                'avatar'        => $this->resolveImageUrl($guide->profile_picture, $host),
                'location'      => $guide->country?->country_name ?? 'Indonesia',
                'rating'        => (float) ($guide->rating ?? 0),
                'reviews_count' => $guide->reviews()->count(),
                'experience'    => ($guide->experience_years ?? 0) . '+ years',
                'about'         => $guide->about ?? '',
                'languages'     => $guide->languages->pluck('name')->values(),
                'specialties'   => $guide->specialities->pluck('name')->values(),
                'total_tours'   => $guide->tours->count(),
            ],
            'tours' => $tours,
        ]);
    }

    private function resolveImageUrl(?string $path, string $host): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'http')) return $path;
        return $host . '/storage/' . $path;
    }
}

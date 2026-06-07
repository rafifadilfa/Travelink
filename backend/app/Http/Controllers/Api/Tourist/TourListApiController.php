<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Tour;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TourListApiController extends Controller
{
    /**
     * GET /api/tours
     * Kembalikan semua tour berstatus published beserta info guide, lokasi, gambar, dan kategori.
     * Endpoint publik — tidak butuh login.
     */
    public function index(Request $request): JsonResponse
    {
        $tours = Tour::with(['images', 'location', 'categories', 'guide', 'reviews'])
            ->where('tour_status', 'published')
            ->get()
            ->map(function (Tour $tour) {
                // Ambil gambar pertama; fallback ke null
                $firstImage = $tour->images->first();
                $imageUrl   = null;
                if ($firstImage) {
                    $path = $firstImage->image_path;
                    // Kalau sudah berupa URL penuh (http/https), pakai langsung
                    $imageUrl = str_starts_with($path, 'http')
                        ? $path
                        : Storage::url($path);
                }

                return [
                    'id'            => $tour->id,
                    'name'          => $tour->name,
                    'description'   => $tour->tour_description,
                    'price'         => (int) $tour->tour_price,
                    'duration'      => $tour->tour_duration,
                    'rating'        => (float) $tour->tour_rating,
                    'reviews_count' => $tour->reviews->count(),
                    'featured'      => (bool) $tour->featured,
                    'is_open_trip'  => (bool) $tour->is_open_trip,
                    'location'      => $tour->location?->name ?? '-',
                    'image_url'     => $imageUrl,
                    'categories'    => $tour->categories->pluck('name')->values(),
                    'guide'         => $tour->guide ? [
                        'id'     => $tour->guide->id,
                        'name'   => $tour->guide->name,
                        'rating' => (float) $tour->guide->rating,
                    ] : null,
                ];
            });

        return response()->json([
            'data'  => $tours,
            'total' => $tours->count(),
        ]);
    }

    /**
     * GET /api/tours/{id}
     * Detail satu tour — endpoint publik.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $tour = Tour::with(['images', 'location', 'categories', 'guide', 'reviews', 'itineraries', 'items'])
            ->findOrFail($id);

        $host = $request->getSchemeAndHttpHost();

        $images = $tour->images->map(fn($img) => [
            'id'  => $img->id,
            'url' => str_starts_with($img->image_path, 'http')
                ? $img->image_path
                : ($host . '/storage/' . $img->image_path),
        ])->values();

        $included = $tour->items->where('pivot.is_included', true)->pluck('name')->values();
        $excluded = $tour->items->where('pivot.is_included', false)->pluck('name')->values();

        $guide = $tour->guide ? [
            'id'     => $tour->guide->id,
            'name'   => $tour->guide->name,
            'rating' => (float) $tour->guide->rating,
            'avatar' => $tour->guide->profile_picture
                ? ($host . '/storage/' . $tour->guide->profile_picture)
                : null,
        ] : null;

        return response()->json([
            'tour' => [
                'id'            => $tour->id,
                'name'          => $tour->name,
                'description'   => $tour->tour_description,
                'price'         => (int) $tour->tour_price,
                'duration'      => $tour->tour_duration,
                'rating'        => (float) ($tour->tour_rating ?? 0),
                'reviews_count' => $tour->reviews->count(),
                'is_open_trip'  => (bool) $tour->is_open_trip,
                'status'        => $tour->tour_status,
                'location'      => $tour->location?->name ?? '-',
                'categories'    => $tour->categories->pluck('name')->values(),
                'images'        => $images,
                'itinerary'     => $tour->itineraries->map(fn($it) => [
                    'time'     => $it->start_time ?? '',
                    'activity' => $it->activity ?? '',
                ])->values(),
                'included'      => $included->values(),
                'excluded'      => $excluded->values(),
                'guide'         => $guide,
            ],
        ]);
    }
}

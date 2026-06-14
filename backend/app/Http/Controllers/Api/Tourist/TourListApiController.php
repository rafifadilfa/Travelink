<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourAvailability;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TourListApiController extends Controller
{
    /**
     * GET /api/tours
     * Query params: search=keyword, price_min=X, price_max=Y
     * Filter dilakukan di query DB, bukan di PHP.
     */
    public function index(Request $request): JsonResponse
    {
        $host = $request->getSchemeAndHttpHost();

        $query = Tour::with(['images', 'location', 'categories', 'guide', 'reviews'])
            ->where('tour_status', 'published');

        // TC-035: filter keyword pada nama/deskripsi/lokasi
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('tour_description', 'like', "%{$search}%")
                  ->orWhereHas('location', fn($l) => $l->where('name', 'like', "%{$search}%"));
            });
        }

        // TC-036: filter rentang harga
        if ($priceMin = $request->input('price_min')) {
            $query->where('tour_price', '>=', (int) $priceMin);
        }
        if ($priceMax = $request->input('price_max')) {
            $query->where('tour_price', '<=', (int) $priceMax);
        }

        $tours = $query->get()->map(function (Tour $tour) use ($host) {
                $firstImage = $tour->images->first();
                $imageUrl   = null;
                if ($firstImage) {
                    $path = $firstImage->image_path;
                    $imageUrl = str_starts_with($path, 'http')
                        ? $path
                        : ($host . '/storage/' . $path);
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
        $tour = Tour::with(['images', 'location', 'categories', 'guide', 'reviews', 'itineraries', 'items', 'availabilities'])
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
                'guide'          => $guide,
                'available_days' => $tour->availabilities->map(fn($a) => [
                    'day_of_week' => $a->day_of_week,
                    'label'       => TourAvailability::DAY_LABELS[$a->day_of_week] ?? '',
                ])->values(),
            ],
        ]);
    }

    /**
     * GET /api/tours/{id}/availabilities
     * Kembalikan hari tersedia + tanggal-tanggal yang sudah di-book dalam 3 bulan ke depan.
     * Dipakai frontend untuk render kalender pemilihan tanggal.
     */
    public function availabilities(int $id): JsonResponse
    {
        $tour = Tour::with('availabilities')->findOrFail($id);

        $availableDays = $tour->availabilities->pluck('day_of_week')->toArray();

        // Tanggal-tanggal yang sudah ter-booking (status aktif) dalam 3 bulan ke depan
        $today    = Carbon::today();
        $threeMonthsLater = $today->copy()->addMonths(3);

        $bookedDates = Transaction::where('tour_id', $id)
            ->whereBetween('tour_date', [$today->toDateString(), $threeMonthsLater->toDateString()])
            ->whereHas('booking', fn($q) => $q->whereIn('booking_status', Booking::ACTIVE_STATUSES))
            ->pluck('tour_date')
            ->map(fn($d) => $d instanceof Carbon ? $d->toDateString() : (string) $d)
            ->unique()
            ->values();

        // Bangun daftar tanggal tersedia dalam 3 bulan ke depan
        $availableDates = [];
        $cursor = $today->copy()->addDay();
        while ($cursor->lessThanOrEqualTo($threeMonthsLater)) {
            if (in_array($cursor->dayOfWeek, $availableDays)) {
                $availableDates[] = $cursor->toDateString();
            }
            $cursor->addDay();
        }

        return response()->json([
            'available_days'  => array_map(fn($d) => [
                'day_of_week' => $d,
                'label'       => TourAvailability::DAY_LABELS[$d] ?? '',
            ], $availableDays),
            'available_dates' => $availableDates,
            'booked_dates'    => $bookedDates,
        ]);
    }
}

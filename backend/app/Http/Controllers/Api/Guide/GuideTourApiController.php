<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Country;
use App\Models\Item;
use App\Models\Location;
use App\Models\Tour;
use App\Models\TourImage;
use App\Models\TourItinerary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Manajemen paket tour oleh pemandu wisata (verified).
 * Semua endpoint dilindungi EnsureGuideIsVerified.
 */
class GuideTourApiController extends Controller
{
    // ── Helper: format satu tour untuk response list ─────────────────────────
    private function formatTour(Tour $tour): array
    {
        return [
            'id'          => $tour->id,
            'title'       => $tour->name,
            'status'      => $tour->tour_status ?? 'draft',
            'bookings'    => $tour->openTripGroups()->whereNull('rejected_at')->count(),
            'rating'      => $tour->tour_rating ?? null,
            'price'       => (int) ($tour->tour_price ?? 0),
            'is_open_trip' => (bool) $tour->is_open_trip,
        ];
    }

    // ── Helper: format tour lengkap untuk form edit ───────────────────────────
    private function formatTourDetail(Tour $tour): array
    {
        $tour->load(['categories', 'itineraries', 'items', 'images']);

        $included = $tour->items->where('pivot.is_included', true)->pluck('name')->values();
        $excluded = $tour->items->where('pivot.is_included', false)->pluck('name')->values();

        $host = request()->getSchemeAndHttpHost();

        return [
            'id'           => $tour->id,
            'title'        => $tour->name,
            'description'  => $tour->tour_description,
            'location'     => $tour->location?->name ?? '',
            'category'     => $tour->categories->first()?->name ?? '',
            'price'        => (string) ((int) ($tour->tour_price ?? 0)),
            'duration'     => $tour->tour_duration ?? '',
            'status'       => $tour->tour_status ?? 'draft',
            'is_open_trip' => (bool) $tour->is_open_trip,
            'itinerary'    => $tour->itineraries->map(fn($it) => [
                'time'     => $it->start_time ?? '',
                'activity' => $it->activity ?? '',
            ])->values(),
            'included' => $included->isEmpty() ? [''] : $included->toArray(),
            'excluded' => $excluded->isEmpty() ? [''] : $excluded->toArray(),
            'images'   => $tour->images->map(fn($img) => [
                'id'  => $img->id,
                'url' => $host . '/storage/' . $img->image_path,
            ])->values(),
        ];
    }

    // ================================================================
    // GET /api/guide/tours
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $guide  = $request->user();
        $tours  = $guide->tours()->orderBy('created_at', 'desc')->get();

        return response()->json([
            'tours' => $tours->map(fn($t) => $this->formatTour($t)),
        ], 200);
    }

    // ================================================================
    // POST /api/guide/tours
    // ================================================================
    public function store(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string'],
            'location'    => ['sometimes', 'nullable', 'string', 'max:200'],
            'category'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'price'       => ['required', 'numeric', 'min:0'],
            'duration'    => ['sometimes', 'nullable', 'string', 'max:100'],
            'status'       => ['sometimes', 'in:draft,published'],
            'is_open_trip' => ['sometimes', 'boolean'],
            'itinerary'   => ['sometimes', 'array'],
            'itinerary.*.time'     => ['sometimes', 'string'],
            'itinerary.*.activity' => ['sometimes', 'string'],
            'included'    => ['sometimes', 'array'],
            'included.*'  => ['string'],
            'excluded'    => ['sometimes', 'array'],
            'excluded.*'  => ['string'],
        ]);

        $locationId = $this->resolveLocationId($validated['location'] ?? null);

        $tour = Tour::create([
            'name'              => $validated['title'],
            'tour_description'  => $validated['description'] ?? null,
            'tour_location_id'  => $locationId,
            'tour_guide_id'     => $guide->id,
            'tour_price'        => $validated['price'],
            'tour_duration'     => $validated['duration'] ?? null,
            'tour_status'       => $validated['status'] ?? 'draft',
            'is_open_trip'      => $validated['is_open_trip'] ?? false,
        ]);

        $this->syncRelations($tour, $validated);

        return response()->json([
            'message' => 'Tour berhasil dibuat.',
            'tour'    => $this->formatTour($tour),
        ], 201);
    }

    // ================================================================
    // GET /api/guide/tours/{id}
    // ================================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();
        $tour  = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);

        return response()->json([
            'tour' => $this->formatTourDetail($tour),
        ], 200);
    }

    // ================================================================
    // PUT /api/guide/tours/{id}
    // ================================================================
    public function update(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();
        $tour  = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);

        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:200'],
            'description'  => ['sometimes', 'nullable', 'string'],
            'location'     => ['sometimes', 'nullable', 'string', 'max:200'],
            'category'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'price'        => ['sometimes', 'numeric', 'min:0'],
            'duration'     => ['sometimes', 'nullable', 'string', 'max:100'],
            'status'       => ['sometimes', 'in:draft,published'],
            'is_open_trip' => ['sometimes', 'boolean'],
            'itinerary'    => ['sometimes', 'array'],
            'itinerary.*.time'     => ['sometimes', 'string'],
            'itinerary.*.activity' => ['sometimes', 'string'],
            'included'     => ['sometimes', 'array'],
            'included.*'   => ['string'],
            'excluded'     => ['sometimes', 'array'],
            'excluded.*'   => ['string'],
        ]);

        if (array_key_exists('location', $validated) && !empty($validated['location'])) {
            $tour->tour_location_id = $this->resolveLocationId($validated['location']);
        }

        $tour->fill([
            'name'             => $validated['title']       ?? $tour->name,
            'tour_description' => $validated['description'] ?? $tour->tour_description,
            'tour_price'       => $validated['price']       ?? $tour->tour_price,
            'tour_duration'    => $validated['duration']    ?? $tour->tour_duration,
            'tour_status'      => $validated['status']      ?? $tour->tour_status,
            'is_open_trip'     => $validated['is_open_trip'] ?? $tour->is_open_trip,
        ])->save();

        $this->syncRelations($tour, $validated);

        return response()->json([
            'message' => 'Tour berhasil diperbarui.',
            'tour'    => $this->formatTourDetail($tour),
        ], 200);
    }

    // ================================================================
    // DELETE /api/guide/tours/{id}  (soft delete)
    // ================================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();
        $tour  = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);
        $tour->delete();

        return response()->json(['message' => 'Tour berhasil dihapus.'], 200);
    }

    // ================================================================
    // POST /api/guide/tours/{id}/images
    // ================================================================
    public function uploadImages(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();
        $tour  = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);

        $request->validate([
            'images'   => ['required', 'array', 'min:1', 'max:10'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $host   = $request->getSchemeAndHttpHost();
        $result = [];

        foreach ($request->file('images') as $order => $file) {
            $path  = $file->store('tours/images', 'public');
            $image = TourImage::create([
                'tour_id'     => $tour->id,
                'image_path'  => $path,
                'image_order' => $tour->images()->count() + $order,
            ]);
            $result[] = [
                'id'    => $image->id,
                'url'   => $host . '/storage/' . $path,
                'order' => $image->image_order,
            ];
        }

        return response()->json([
            'message' => count($result) . ' foto berhasil diupload.',
            'images'  => $result,
        ], 201);
    }

    // ================================================================
    // DELETE /api/guide/tours/{id}/images/{imageId}
    // ================================================================
    public function destroyImage(Request $request, int $id, int $imageId): JsonResponse
    {
        $guide = $request->user();
        $tour  = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);
        $image = $tour->images()->findOrFail($imageId);

        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return response()->json(['message' => 'Foto berhasil dihapus.'], 200);
    }

    // ── Private: cari atau buat Location, kembalikan ID-nya ──────────────────
    private function resolveLocationId(?string $name): ?int
    {
        if (empty($name)) return null;

        $location = Location::firstOrCreate(
            ['name' => trim($name)],
            ['country_id' => Country::where('ISO_code_2', 'ID')->value('id')]
        );

        return $location->id;
    }

    // ── Private: sync kategori, itinerary, item ───────────────────────────────
    private function syncRelations(Tour $tour, array $data): void
    {
        // Kategori
        if (!empty($data['category'])) {
            $cat = Category::firstOrCreate(['name' => trim($data['category'])]);
            $tour->categories()->sync([$cat->id]);
        }

        // Itinerary — hapus lama, buat baru
        if (isset($data['itinerary'])) {
            $tour->itineraries()->delete();
            foreach ($data['itinerary'] as $i => $step) {
                if (!empty($step['activity'])) {
                    TourItinerary::create([
                        'tour_id'     => $tour->id,
                        'step_number' => $i + 1,
                        'start_time'  => $step['time']     ?? null,
                        'activity'    => $step['activity'] ?? '',
                    ]);
                }
            }
        }

        // Items included/excluded — hapus semua lama, sync baru
        if (isset($data['included']) || isset($data['excluded'])) {
            $tour->items()->detach();

            foreach ($data['included'] ?? [] as $name) {
                if (!empty(trim($name))) {
                    $item = Item::firstOrCreate(['name' => trim($name)]);
                    $tour->items()->attach($item->id, ['is_included' => true]);
                }
            }

            foreach ($data['excluded'] ?? [] as $name) {
                if (!empty(trim($name))) {
                    $item = Item::firstOrCreate(['name' => trim($name)]);
                    $tour->items()->attach($item->id, ['is_included' => false]);
                }
            }
        }
    }
}

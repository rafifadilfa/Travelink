<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Location;
use App\Models\MeetingPoint;
use App\Models\DayPhase;
use App\Models\Tour;
use App\Models\TourAvailability;
use App\Models\TourImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Manajemen paket wisata oleh pemandu terverifikasi (UC-14).
 * Semua endpoint dilindungi EnsureGuideIsVerified — hanya guide 'verified'.
 */
class GuideTourApiController extends Controller
{
    // ----------------------------------------------------------------
    // Helper: format satu tour untuk response (list & detail)
    // ----------------------------------------------------------------
    private function formatTour(Tour $tour, bool $detail = false): array
    {
        $host = request()->getSchemeAndHttpHost();

        $images = $tour->images->map(fn($img) => [
            'id'      => $img->id,
            'url'     => $host . '/storage/' . $img->image_path,
            'caption' => $img->image_caption,
            'order'   => $img->image_order,
        ]);

        $availabilities = $tour->availabilities->map(fn($a) => [
            'day_of_week' => $a->day_of_week,
            'label'       => $a->day_label,
        ]);

        $data = [
            'id'                   => $tour->id,
            'name'                 => $tour->name,
            'type'                 => $tour->type,
            'description'          => $tour->tour_description,
            'price'                => $tour->tour_price,
            'duration'             => $tour->tour_duration,
            'start_time'           => $tour->tour_start_time
                ? \Carbon\Carbon::parse($tour->tour_start_time)->format('H:i') : null,
            'max_participants'     => $tour->tour_max_participants,
            'min_participants'     => $tour->tour_min_participants,
            'status'               => $tour->tour_status,
            'rating'               => $tour->tour_rating,
            'review_count'         => $tour->tour_review_count,
            'booking_count'        => $tour->tour_booking_count,
            'featured'             => (bool) $tour->featured,
            'is_open_trip'         => (bool) $tour->is_open_trip,
            'images'               => $images,
            'first_image_url'      => $images->first()['url'] ?? null,
            'availabilities'       => $availabilities,
            'availability_days'    => $availabilities->pluck('day_of_week')->values(),
            'location'             => $tour->location ? ['id' => $tour->location->id, 'name' => $tour->location->name] : null,
            'meeting_point'        => $tour->meetingPoint ? ['id' => $tour->meetingPoint->id, 'name' => $tour->meetingPoint->name] : null,
            'dayphase'             => $tour->dayphase ? ['id' => $tour->dayphase->id, 'name' => $tour->dayphase->name] : null,
            'created_at'           => $tour->created_at,
            'updated_at'           => $tour->updated_at,
            'deleted_at'           => $tour->deleted_at,
        ];

        return $data;
    }

    // ----------------------------------------------------------------
    // Helper: simpan file gambar dan buat record TourImage
    // ----------------------------------------------------------------
    private function storeImages(Tour $tour, array $files, array $captions = []): void
    {
        // Ambil order tertinggi yang sudah ada
        $maxOrder = $tour->images()->max('image_order') ?? 0;

        foreach ($files as $idx => $file) {
            $path = $file->store('tour_images', 'public');
            TourImage::create([
                'tour_id'       => $tour->id,
                'image_path'    => $path,
                'image_order'   => $maxOrder + $idx + 1,
                'image_caption' => $captions[$idx] ?? null,
            ]);
        }
    }

    // ----------------------------------------------------------------
    // Helper: sync availability days
    // ----------------------------------------------------------------
    private function syncAvailabilities(Tour $tour, array $days): void
    {
        $tour->availabilities()->delete();
        foreach (array_unique($days) as $day) {
            if ($day >= 0 && $day <= 6) {
                TourAvailability::create(['tour_id' => $tour->id, 'day_of_week' => (int) $day]);
            }
        }
    }

    // ----------------------------------------------------------------
    // Helper: parse start_time string → datetime untuk kolom timestamp
    // Input: "HH:MM" atau "HH:MM:SS"
    // ----------------------------------------------------------------
    private function parseStartTime(string $time): string
    {
        // Normalise ke HH:MM:SS lalu gabung dengan tanggal referensi tetap
        $parts = array_pad(explode(':', $time), 3, '00');
        return sprintf('2000-01-01 %02d:%02d:00', (int)$parts[0], (int)$parts[1]);
    }

    // ================================================================
    // GET /api/guide/tours — daftar semua tour milik guide
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();

        $tours = Tour::where('tour_guide_id', $guide->id)
            ->with(['images', 'availabilities', 'location', 'meetingPoint', 'dayphase'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'tours' => $tours->map(fn($t) => $this->formatTour($t)),
        ], 200);
    }

    // ================================================================
    // POST /api/guide/tours — buat paket tour baru (UC-14)
    // Content-Type: multipart/form-data
    // ================================================================
    public function store(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'name'               => ['required', 'string', 'max:100'],
            'type'               => ['required', 'in:regular,open_trip'],
            'description'        => ['required', 'string', 'max:500'],
            'location_id'        => ['required', 'exists:locations,id'],
            'meeting_point_id'   => ['required', 'exists:meeting_points,id'],
            'price'              => ['required', 'integer', 'min:0'],
            'duration'           => ['required', 'integer', 'min:1'],
            'start_time'         => ['required', 'string', 'regex:/^\d{1,2}:\d{2}(:\d{2})?$/'],
            'period_id'          => ['required', 'exists:day_phases,id'],
            'max_participants'   => ['required', 'integer', 'min:1'],
            'min_participants'   => ['required', 'integer', 'min:1', 'lte:max_participants'],
            // Minimal 1 hari ketersediaan wajib (UC-14 A1)
            'availability_days'   => ['required', 'array', 'min:1'],
            'availability_days.*' => ['integer', 'between:0,6'],
            'is_open_trip'       => ['sometimes', 'boolean'],
            'status'             => ['sometimes', 'in:draft,published'],
            // Gambar opsional saat buat
            'images'             => ['sometimes', 'array'],
            'images.*'           => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image_captions'     => ['sometimes', 'array'],
            'image_captions.*'   => ['nullable', 'string', 'max:200'],
        ]);

        $tour = Tour::create([
            'name'                  => $validated['name'],
            'type'                  => $validated['type'],
            'tour_description'      => $validated['description'],
            'tour_location_id'      => $validated['location_id'],
            'tour_meeting_point_id' => $validated['meeting_point_id'],
            'tour_guide_id'         => $guide->id,
            'tour_price'            => $validated['price'],
            'tour_duration'         => $validated['duration'],
            'tour_start_time'       => $this->parseStartTime($validated['start_time']),
            'tour_period_id'        => $validated['period_id'],
            'tour_max_participants' => $validated['max_participants'],
            'tour_min_participants' => $validated['min_participants'],
            'tour_status'           => $validated['status'] ?? 'draft',
            'is_open_trip'          => $validated['is_open_trip'] ?? false,
        ]);

        // Sync jadwal ketersediaan
        $this->syncAvailabilities($tour, $validated['availability_days']);

        // Upload gambar jika ada
        if ($request->hasFile('images')) {
            $this->storeImages($tour, $request->file('images'), $validated['image_captions'] ?? []);
        }

        // Update hitungan tour milik guide
        $guide->increment('total_tours');

        $tour->load(['images', 'availabilities', 'location', 'meetingPoint', 'dayphase']);

        return response()->json([
            'message' => 'Paket tour berhasil dibuat.',
            'tour'    => $this->formatTour($tour),
        ], 201);
    }

    // ================================================================
    // GET /api/guide/tours/{id} — detail satu tour
    // ================================================================
    public function show(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $tour = Tour::where('tour_guide_id', $guide->id)
            ->with(['images', 'availabilities', 'location', 'meetingPoint', 'dayphase'])
            ->findOrFail($id);

        return response()->json(['tour' => $this->formatTour($tour)], 200);
    }

    // ================================================================
    // PUT /api/guide/tours/{id} — update paket tour (UC-14 S-1)
    // Content-Type: multipart/form-data (karena bisa upload gambar baru)
    // ================================================================
    public function update(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $tour = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);

        $validated = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:100'],
            'type'                 => ['sometimes', 'in:regular,open_trip'],
            'description'          => ['sometimes', 'string', 'max:500'],
            'location_id'          => ['sometimes', 'exists:locations,id'],
            'meeting_point_id'     => ['sometimes', 'exists:meeting_points,id'],
            'price'                => ['sometimes', 'integer', 'min:0'],
            'duration'             => ['sometimes', 'integer', 'min:1'],
            'start_time'           => ['sometimes', 'string', 'regex:/^\d{1,2}:\d{2}(:\d{2})?$/'],
            'period_id'            => ['sometimes', 'exists:day_phases,id'],
            'max_participants'     => ['sometimes', 'integer', 'min:1'],
            'min_participants'     => ['sometimes', 'integer', 'min:1'],
            'is_open_trip'         => ['sometimes', 'boolean'],
            'status'               => ['sometimes', 'in:draft,published'],
            'availability_days'    => ['sometimes', 'array', 'min:1'],
            'availability_days.*'  => ['integer', 'between:0,6'],
            // Gambar baru ditambahkan (tidak menggantikan yang lama)
            'new_images'           => ['sometimes', 'array'],
            'new_images.*'         => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'new_image_captions'   => ['sometimes', 'array'],
            'new_image_captions.*' => ['nullable', 'string', 'max:200'],
            // ID gambar yang ingin dihapus
            'delete_image_ids'     => ['sometimes', 'array'],
            'delete_image_ids.*'   => ['integer'],
        ]);

        // Update field teks
        $updateData = array_filter([
            'name'                  => $validated['name'] ?? null,
            'type'                  => $validated['type'] ?? null,
            'tour_description'      => $validated['description'] ?? null,
            'tour_location_id'      => $validated['location_id'] ?? null,
            'tour_meeting_point_id' => $validated['meeting_point_id'] ?? null,
            'tour_price'            => $validated['price'] ?? null,
            'tour_duration'         => $validated['duration'] ?? null,
            'tour_start_time'       => isset($validated['start_time'])
                ? $this->parseStartTime($validated['start_time']) : null,
            'tour_period_id'        => $validated['period_id'] ?? null,
            'tour_max_participants' => $validated['max_participants'] ?? null,
            'tour_min_participants' => $validated['min_participants'] ?? null,
            'tour_status'           => $validated['status'] ?? null,
            'is_open_trip'          => $validated['is_open_trip'] ?? null,
        ], fn($v) => $v !== null);

        $tour->update($updateData);

        // Sync jadwal ketersediaan jika diberikan
        if (isset($validated['availability_days'])) {
            $this->syncAvailabilities($tour, $validated['availability_days']);
        }

        // Hapus gambar yang diminta
        if (!empty($validated['delete_image_ids'])) {
            $toDelete = TourImage::whereIn('id', $validated['delete_image_ids'])
                ->where('tour_id', $tour->id)
                ->get();
            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
        }

        // Tambah gambar baru
        if ($request->hasFile('new_images')) {
            $this->storeImages($tour, $request->file('new_images'), $validated['new_image_captions'] ?? []);
        }

        $tour->load(['images', 'availabilities', 'location', 'meetingPoint', 'dayphase']);

        return response()->json([
            'message' => 'Paket tour berhasil diperbarui.',
            'tour'    => $this->formatTour($tour),
        ], 200);
    }

    // ================================================================
    // DELETE /api/guide/tours/{id} — soft delete tour (UC-14 S-2)
    // Menolak jika masih ada pesanan aktif.
    // ================================================================
    public function destroy(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $tour = Tour::where('tour_guide_id', $guide->id)->findOrFail($id);

        // Cek pesanan aktif yang terkait tour ini
        $activeBookings = Booking::whereHas('transaction', fn($q) => $q->where('tour_id', $tour->id))
            ->whereIn('booking_status', Booking::ACTIVE_STATUSES)
            ->count();

        if ($activeBookings > 0) {
            return response()->json([
                'message'        => "Tidak dapat menghapus tour karena masih ada {$activeBookings} pesanan aktif. Nonaktifkan tour terlebih dahulu.",
                'active_bookings' => $activeBookings,
            ], 422);
        }

        $tour->delete(); // soft delete

        return response()->json(['message' => 'Paket tour berhasil dihapus.'], 200);
    }

    // ================================================================
    // GET /api/guide/tours/reference — data referensi untuk form create/edit
    // ================================================================
    public function reference(): JsonResponse
    {
        return response()->json([
            'locations'      => Location::orderBy('name')->get(['id', 'name']),
            'meeting_points' => MeetingPoint::orderBy('name')->get(['id', 'name']),
            'day_phases'     => DayPhase::orderBy('id')->get(['id', 'name', 'description']),
            'day_labels'     => \App\Models\TourAvailability::DAY_LABELS,
        ], 200);
    }
}

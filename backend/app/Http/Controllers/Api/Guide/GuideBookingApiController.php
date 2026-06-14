<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Manajemen pesanan masuk pemandu (UC-21 & UC-15). Dilindungi EnsureGuideIsVerified.
class GuideBookingApiController extends Controller
{
    // Helper: format booking untuk response
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
                    'phone_country_code' => $transaction->user->phonecountrycode?->phone_country_code,
                    'phone_number'       => $transaction->user->phone_number,
                    'avatar_url' => $transaction->user->profile_photo_path
                        ? $host . '/storage/' . $transaction->user->profile_photo_path : null,
                ] : null,
            ] : null,
        ];
    }

    // GET /api/guide/bookings?tab=active|history — UC-21: daftar pesanan masuk
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();
        $tab   = $request->get('tab', 'active');

        $query = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->with(['transaction.tour', 'transaction.user.phonecountrycode'])
            ->orderBy('created_at', 'desc');

        if ($tab === 'history') {
            // Riwayat: status terminal
            $query->whereIn('booking_status', Booking::TERMINAL_STATUSES);
        } else {
            // Aktif: semua status yang masih berjalan
            $query->whereIn('booking_status', Booking::ACTIVE_STATUSES);
        }

        $bookings = $query->paginate(15);

        $today = now()->toDateString();

        $groupQuery = OpenTripGroup::whereHas('tour', fn($q) => $q->where('tour_guide_id', $guide->id))
            ->with([
                'tour:id,name',
                'participants' => fn($q) => $q->where('status', 'matched'),
            ])
            ->whereNull('rejected_at'); // grup yang ditolak tidak ditampilkan di mana pun

        if ($tab === 'history') {
            $groupQuery->whereDate('trip_date', '<', $today);
        } else {
            $groupQuery->whereDate('trip_date', '>=', $today);
        }

        $openTripGroups = $groupQuery->orderBy('trip_date', 'asc')->get()
            ->map(function (OpenTripGroup $g): array {
                $members   = $g->participants;
                $paidCount = $members->where('payment_status', 'paid')->count();
                return [
                    'id'           => $g->id,
                    'tour_id'      => $g->tour_id,
                    'tour_name'    => $g->tour?->name,
                    'trip_date'    => $g->trip_date?->format('Y-m-d'),
                    'member_count' => $members->count(),
                    'paid_count'   => $paidCount,
                    'matched_at'   => $g->matched_at?->toIso8601String(),
                    'expires_at'   => $g->expires_at?->toIso8601String(),
                    'confirmed_at' => $g->confirmed_at?->toIso8601String(),
                    'is_active'    => $g->isActive(),
                ];
            });

        return response()->json([
            'tab'              => $tab,
            'data'             => collect($bookings->items())->map(fn($b) => $this->formatBooking($b)),
            'meta'             => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'total'        => $bookings->total(),
            ],
            'open_trip_groups' => $openTripGroups,
        ], 200);
    }

    // GET /api/guide/bookings/{id} — detail satu pesanan
    public function show(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $booking = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->with(['transaction.tour', 'transaction.user'])
            ->findOrFail($id);

        return response()->json(['booking' => $this->formatBooking($booking)], 200);
    }

    // POST /api/guide/bookings/{id}/accept — UC-15: terima pesanan → menunggu_pembayaran
    public function accept(Request $request, int $id): JsonResponse
    {
        $guide = $request->user();

        $booking = Booking::whereHas('transaction', fn($q) => $q->where('guide_id', $guide->id))
            ->where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->findOrFail($id);

        $booking->update(['booking_status' => Booking::STATUS_MENUNGGU_PEMBAYARAN]);

        $booking->load(['transaction.tour', 'transaction.user']);

        // TC-029: notifikasi wisatawan — booking diterima
        $userId   = $booking->transaction?->user?->id;
        $tourName = $booking->transaction?->tour?->name ?? 'paket wisata';
        if ($userId) {
            NotificationService::send(
                'booking_accepted',
                'user',
                $userId,
                'Booking Diterima',
                "Pemandu telah menerima booking Anda untuk {$tourName}. Silakan lakukan pembayaran.",
                ['booking_id' => $booking->id]
            );
        }

        return response()->json([
            'message' => 'Pesanan berhasil diterima. Wisatawan akan diminta melakukan pembayaran.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }

    // POST /api/guide/bookings/{id}/reject — UC-15 A1: tolak pesanan → ditolak
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

        $booking->load(['transaction.tour', 'transaction.user']);

        // TC-030: notifikasi wisatawan — booking ditolak
        $userId   = $booking->transaction?->user?->id;
        $tourName = $booking->transaction?->tour?->name ?? 'paket wisata';
        if ($userId) {
            NotificationService::send(
                'booking_rejected',
                'user',
                $userId,
                'Booking Ditolak',
                "Pemandu menolak booking Anda untuk {$tourName}. Alasan: {$validated['rejection_reason']}",
                ['booking_id' => $booking->id]
            );
        }

        return response()->json([
            'message' => 'Pesanan ditolak.',
            'booking' => $this->formatBooking($booking),
        ], 200);
    }

    // POST /api/guide/open-trip-groups/{groupId}/reject — tolak grup SOT jika 0 anggota bayar
    // group_id peserta TIDAK dikosongkan agar /open-trip/status bisa deteksi cancelled_by_guide
    public function rejectOpenTripGroup(Request $request, int $groupId): JsonResponse
    {
        $guide = $request->user();

        // Pastikan grup ada dan tournya milik guide ini
        $group = OpenTripGroup::whereHas('tour', fn($q) => $q->where('tour_guide_id', $guide->id))
            ->with(['participants' => fn($q) => $q->where('status', 'matched')])
            ->find($groupId);

        if (! $group) {
            return response()->json([
                'message' => 'Grup tidak ditemukan atau bukan milik Anda.',
            ], 403);
        }

        if ($group->isRejected()) {
            return response()->json([
                'message' => 'Grup ini sudah pernah ditolak sebelumnya.',
            ], 422);
        }

        // Hitung berapa anggota yang sudah membayar
        $paidCount = $group->participants->where('payment_status', 'paid')->count();

        if ($paidCount > 0) {
            return response()->json([
                'message' => "Tidak dapat menolak grup: {$paidCount} anggota sudah melakukan pembayaran.",
            ], 422);
        }

        $group->update(['rejected_at' => now()]);

        // group_id SENGAJA tidak dikosongkan — lihat komentar header method di atas
        OpenTripParticipant::where('group_id', $group->id)
            ->where('status', 'matched')
            ->update([
                'status'         => 'cancelled',
                'payment_status' => null,
            ]);

        return response()->json([
            'message'    => 'Grup Smart Open Trip berhasil ditolak. Semua peserta telah dikeluarkan dari grup.',
            'group_id'   => $group->id,
            'rejected_at' => $group->rejected_at->toIso8601String(),
        ], 200);
    }

    // POST /api/guide/open-trip-groups/{groupId}/confirm — TC-037: konfirmasi grup, notifikasi semua peserta
    public function confirmOpenTripGroup(Request $request, int $groupId): JsonResponse
    {
        $guide = $request->user();

        $group = OpenTripGroup::whereHas('tour', fn($q) => $q->where('tour_guide_id', $guide->id))
            ->with(['participants' => fn($q) => $q->where('status', 'matched'), 'tour'])
            ->whereNull('rejected_at')
            ->whereNull('confirmed_at')
            ->find($groupId);

        if (! $group) {
            return response()->json(['message' => 'Grup tidak ditemukan atau sudah dikonfirmasi/ditolak.'], 404);
        }

        $group->update(['confirmed_at' => now()]);

        // TC-037: notifikasi ke semua peserta yang matched
        $tourName = $group->tour?->name ?? 'paket wisata';
        foreach ($group->participants as $participant) {
            NotificationService::send(
                'group_confirmed',
                'user',
                $participant->user_id,
                'Grup Dikonfirmasi',
                "Pemandu telah mengkonfirmasi grup Open Trip {$tourName}. Silakan lakukan pembayaran.",
                ['group_id' => $group->id, 'tour_id' => $group->tour_id]
            );
        }

        return response()->json([
            'message'      => 'Grup berhasil dikonfirmasi. Peserta telah dinotifikasi.',
            'confirmed_at' => $group->fresh()->confirmed_at?->toIso8601String(),
        ], 200);
    }
}

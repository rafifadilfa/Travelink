<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Models\Tour;
use App\Services\OpenTripMatchingService;
use App\Services\ProfileMatchingService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction;

class OpenTripController extends Controller
{
    public function __construct(
        private OpenTripMatchingService $matchingService,
        private ProfileMatchingService  $matcher,
    ) {}

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/form-data?tour_id={id}&date={YYYY-MM-DD}
    // ════════════════════════════════════════════════════════════════════════

    public function formData(Request $request): JsonResponse
    {
        $request->validate([
            'tour_id' => ['required', 'integer', 'exists:tours,id'],
            'date'    => ['required', 'date_format:Y-m-d'],
        ]);

        $tourId = $request->integer('tour_id');
        $date   = $request->string('date');

        $tour = Tour::select('id', 'name', 'tour_price', 'tour_description', 'tour_location_id')
            ->with('location:id,name')
            ->where('id', $tourId)
            ->where('is_open_trip', true)
            ->firstOrFail();

        $categories = Category::select('id', 'name')
            ->with(['openTripActivities:id,name,category_id'])
            ->whereHas('openTripActivities')
            ->get();

        $alreadyJoined       = false;
        $existingParticipant = null;
        $registrationCount   = 0;

        if (Auth::check()) {
            // Ambil baris apapun (termasuk cancelled) untuk info registration_count
            $anyParticipant = OpenTripParticipant::where('user_id', Auth::id())
                ->where('tour_id', $tourId)
                ->where('trip_date', $date)
                ->first();

            $registrationCount = $anyParticipant?->registration_count ?? 0;

            if ($anyParticipant && in_array($anyParticipant->status, ['waiting', 'matched'])) {
                $existingParticipant = $anyParticipant->load([
                    'interests:id,name',
                    'preferences:id,name,category_id',
                ]);
                $alreadyJoined = true;
            }
        }

        // can_register: tidak sedang aktif (waiting/matched) DAN belum habis kuota 3x
        $canRegister = ! $alreadyJoined && $registrationCount < 3;

        return response()->json([
            'tour' => [
                'id'          => $tour->id,
                'name'        => $tour->name,
                'price'       => $tour->tour_price,
                'description' => $tour->tour_description,
                'location'    => $tour->location?->name,
            ],
            'categories'            => $categories,
            'date'                  => $date,
            'already_joined'        => $alreadyJoined,
            'registration_count'    => $registrationCount,
            'registrations_remaining' => max(0, 3 - $registrationCount),
            'can_register'          => $canRegister,
            'participant'           => $existingParticipant
                ? $existingParticipant->toProfileArray()
                : null,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /api/open-trip/join
    // ════════════════════════════════════════════════════════════════════════

    public function join(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tour_id'        => ['required', 'integer', 'exists:tours,id'],
            'trip_date'      => ['required', 'date_format:Y-m-d'],
            'age'            => ['required', 'integer', 'min:1', 'max:99'],
            'interest_ids'   => ['required', 'array', 'min:1'],
            'interest_ids.*' => ['integer', 'exists:categories,id'],
            'activity_ids'   => ['required', 'array', 'min:1'],
            'activity_ids.*' => ['integer', 'exists:open_trip_activities,id'],
            'budget_level'   => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        Tour::where('id', $validated['tour_id'])
            ->where('is_open_trip', true)
            ->firstOrFail();

        $userId   = Auth::id();
        $existing = OpenTripParticipant::where('user_id', $userId)
            ->where('tour_id', $validated['tour_id'])
            ->where('trip_date', $validated['trip_date'])
            ->first();

        // Tahap 2: peserta sudah masuk grup → tidak boleh ubah preferensi
        if ($existing && $existing->status === 'matched') {
            return response()->json([
                'message'        => 'Kamu sudah masuk ke grup. Preferensi tidak dapat diubah.',
                'participant_id' => $existing->id,
                'group_id'       => $existing->group_id,
                'status'         => 'matched',
            ], 422);
        }

        // Tahap 1, re-daftar setelah cancel: cek batas 3x
        if ($existing && $existing->status === 'cancelled') {
            if ($existing->registration_count >= 3) {
                return response()->json([
                    'message' => 'Kamu sudah mencapai batas pendaftaran untuk trip ini (maksimal 3 kali).',
                ], 422);
            }
        }

        // Simpan preferensi dalam transaksi; kembalikan ID untuk fetch ulang
        $isNew         = $existing === null;
        $participantId = DB::transaction(function () use ($validated, $userId, $existing): int {
            if ($existing) {
                $updateData = [
                    'age'          => $validated['age'],
                    'budget_level' => $validated['budget_level'],
                ];

                // Re-daftar setelah cancel: reset status & naikkan penghitung
                if ($existing->status === 'cancelled') {
                    $updateData['status']             = 'waiting';
                    $updateData['registration_count'] = $existing->registration_count + 1;
                    $updateData['group_id']           = null;
                    $updateData['matching_score']     = null;
                }

                $existing->update($updateData);
                $existing->interests()->sync($validated['interest_ids']);
                $existing->preferences()->sync($validated['activity_ids']);
                return $existing->id;
            }

            $created = OpenTripParticipant::create([
                'user_id'            => $userId,
                'tour_id'            => $validated['tour_id'],
                'trip_date'          => $validated['trip_date'],
                'age'                => $validated['age'],
                'budget_level'       => $validated['budget_level'],
                'status'             => 'waiting',
                'registration_count' => 1,
            ]);
            $created->interests()->sync($validated['interest_ids']);
            $created->preferences()->sync($validated['activity_ids']);
            return $created->id;
        });

        // Jalankan matching — mungkin mengubah status peserta ini ke 'matched'
        $matchingResult = $this->matchingService->runMatching($validated['tour_id'], $validated['trip_date']);

        // Fetch ulang dengan status terbaru
        $participant = OpenTripParticipant::with([
            'interests:id,name',
            'preferences:id,name,category_id',
        ])->findOrFail($participantId);

        return response()->json([
            'message'     => $participant->status === 'matched'
                ? 'Kecocokan ditemukan! Kamu masuk ke grup.'
                : 'Preferensi tersimpan. Menunggu peserta lain yang cocok...',
            'participant' => [
                'id'                 => $participant->id,
                'tour_id'            => $participant->tour_id,
                'trip_date'          => $participant->trip_date->format('Y-m-d'),
                'age'                => $participant->age,
                'budget_level'       => $participant->budget_level,
                'status'             => $participant->status,
                'group_id'           => $participant->group_id,
                'matching_score'     => $participant->matching_score,
                'registration_count' => $participant->registration_count,
                'interests'          => $participant->interests->map(fn($c) => ['id' => $c->id, 'name' => $c->name]),
                'activities'         => $participant->preferences->map(fn($a) => ['id' => $a->id, 'name' => $a->name]),
            ],
            // ── DEBUG SEMENTARA — hapus setelah bug ditemukan ──────────
            '_debug_matching' => $matchingResult,
        ], $isNew ? 201 : 200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/my-trips   (auth:sanctum)
    // Daftar semua Smart Open Trip yang diikuti user yang sedang login.
    // ════════════════════════════════════════════════════════════════════════

    public function myTrips(): JsonResponse
    {
        $participants = OpenTripParticipant::with([
            'tour:id,name,tour_price,tour_location_id',
            'tour.location:id,name',
            'group',
            'group.participants:id,group_id',
        ])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['waiting', 'matched', 'cancelled'])
            ->orderBy('trip_date', 'desc')
            ->get();

        $data = $participants->map(function (OpenTripParticipant $p): array {
            $groupData = null;

            if ($p->group) {
                $groupData = [
                    'id'                => $p->group->id,
                    'member_count'      => $p->group->participants->count(),
                    'expires_at'        => $p->group->expires_at?->toIso8601String(),
                    'seconds_remaining' => $p->group->secondsRemaining(),
                    'is_active'         => $p->group->isActive(),
                ];
            }

            return [
                'participant_id' => $p->id,
                'tour_id'        => $p->tour_id,
                'tour_name'      => $p->tour->name,
                'tour_location'  => $p->tour->location?->name,
                'tour_price'     => $p->tour->tour_price,
                'trip_date'      => $p->trip_date->format('Y-m-d'),
                'status'         => $p->status,
                'matching_score' => $p->matching_score,
                'group_id'       => $p->group_id,
                'group'          => $groupData,
                'payment_status' => $p->payment_status ?? 'unpaid',
                'guide_reviewed' => (bool) $p->guide_reviewed,
            ];
        });

        return response()->json(['data' => $data]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // DELETE /api/open-trip/participants/{participantId}
    // Cancel: hanya bisa jika masih Tahap 1 (status = waiting)
    // ════════════════════════════════════════════════════════════════════════

    public function cancel(int $participantId): JsonResponse
    {
        $participant = OpenTripParticipant::where('id', $participantId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($participant->status === 'matched') {
            return response()->json([
                'message' => 'Tidak dapat membatalkan. Kamu sudah masuk ke grup (Tahap 2). '
                           . 'Pembatalan hanya bisa dilakukan saat masih menunggu di Tahap 1.',
            ], 422);
        }

        if ($participant->status === 'cancelled') {
            return response()->json([
                'message' => 'Pendaftaran ini sudah dibatalkan sebelumnya.',
            ], 422);
        }

        // status === 'waiting' → boleh cancel
        $participant->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Pendaftaran berhasil dibatalkan.']);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /api/open-trip/payment/create
    // Buat transaksi Midtrans untuk peserta yang belum bayar (auth:sanctum)
    // ════════════════════════════════════════════════════════════════════════

    public function createPayment(Request $request): JsonResponse
    {
        $request->validate([
            'participant_id' => ['required', 'integer'],
        ]);

        $participant = OpenTripParticipant::where('id', $request->integer('participant_id'))
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($participant->status !== 'matched' || ! $participant->group_id) {
            return response()->json(['message' => 'Kamu belum masuk ke grup.'], 422);
        }

        if ($participant->payment_status === 'paid') {
            return response()->json(['message' => 'Kamu sudah membayar.'], 422);
        }

        // Hitung jumlah anggota grup dan harga per orang di backend
        $group = $participant->group()->with('tour:id,name,tour_price')->firstOrFail();

        // Grup sudah diproses scheduler — alur pembayaran direct ini sudah tidak berlaku
        if ($group->sot_processed_at !== null) {
            return response()->json([
                'message' => 'Grup ini sudah diproses. Cek halaman Booking untuk status pesananmu.',
            ], 422);
        }

        // Harus konfirmasi keikutsertaan sebelum membayar
        if ($participant->confirmed_at === null) {
            return response()->json([
                'message' => 'Konfirmasi keikutsertaanmu terlebih dahulu sebelum membayar.',
            ], 422);
        }
        $memberCount = OpenTripParticipant::where('group_id', $group->id)
            ->where('status', 'matched')
            ->count();

        if ($memberCount < 1) {
            return response()->json(['message' => 'Grup tidak valid.'], 422);
        }

        $tourPrice     = $group->tour->tour_price;
        $amountPerPerson = (int) ceil($tourPrice / $memberCount);

        // Generate order ID unik per percobaan bayar (timestamp mencegah duplikat di Midtrans)
        $orderId = "OT-{$group->id}-{$participant->id}-" . now()->timestamp;

        // Konfigurasi Midtrans
        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized  = true;
        MidtransConfig::$is3ds        = true;

        $user = Auth::user();

        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $amountPerPerson,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
            ],
            'item_details' => [
                [
                    'id'       => "TOUR-{$group->tour_id}",
                    'price'    => $amountPerPerson,
                    'quantity' => 1,
                    'name'     => "Smart Open Trip: {$group->tour->name} (1/{$memberCount})",
                ],
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }

        // Simpan order_id agar bisa dicek statusnya nanti
        $participant->update([
            'midtrans_order_id' => $orderId,
            'payment_status'    => 'unpaid',
        ]);

        return response()->json([
            'snap_token'       => $snapToken,
            'order_id'         => $orderId,
            'amount_per_person'=> $amountPerPerson,
            'member_count'     => $memberCount,
            'tour_price'       => $tourPrice,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/payment/check/{participantId}
    // Cek status pembayaran ke Midtrans & update DB jika sudah lunas
    // Juga kembalikan status bayar semua anggota grup (auth:sanctum)
    // ════════════════════════════════════════════════════════════════════════

    public function checkPaymentStatus(int $participantId): JsonResponse
    {
        $participant = OpenTripParticipant::where('id', $participantId)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($participant->status !== 'matched' || ! $participant->group_id) {
            return response()->json(['message' => 'Peserta belum dalam grup.'], 422);
        }

        // Jika belum pernah buat transaksi, tidak ada yang perlu dicek
        if (! $participant->midtrans_order_id) {
            return $this->buildPaymentStatusResponse($participant);
        }

        // Jika sudah paid di DB, tidak perlu tanya Midtrans lagi
        if ($participant->payment_status === 'paid') {
            return $this->buildPaymentStatusResponse($participant);
        }

        // Tanya Midtrans status transaksi
        MidtransConfig::$serverKey    = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');

        $isPaid = false;
        try {
            $status = Transaction::status($participant->midtrans_order_id);
            $transactionStatus = $status->transaction_status ?? null;
            $fraudStatus       = $status->fraud_status ?? null;

            // Midtrans: settlement = lunas, capture + not fraud = lunas
            $isPaid = $transactionStatus === 'settlement'
                || ($transactionStatus === 'capture' && $fraudStatus === 'accept');
        } catch (\Exception) {
            // Transaksi belum ada di Midtrans (belum pernah dibayar) — abaikan
        }

        if ($isPaid) {
            $participant->update(['payment_status' => 'paid']);

            // Kredit pending_balance guide pemilik tour (escrow — ditahan).
            // Hanya dipanggil sekali karena setelah 'paid', endpoint ini early-return di atas.
            $group = $participant->group()->with('tour.guide')->first();
            if ($group && $group->tour && $group->tour->guide) {
                $memberCount     = OpenTripParticipant::where('group_id', $group->id)
                    ->where('status', 'matched')
                    ->count();
                $amountPerPerson = (int) ceil($group->tour->tour_price / max(1, $memberCount));
                WalletService::creditPending($group->tour->guide, $amountPerPerson);
            }
        }

        return $this->buildPaymentStatusResponse($participant->fresh());
    }

    /**
     * Bangun response yang berisi status bayar semua anggota grup.
     */
    private function buildPaymentStatusResponse(OpenTripParticipant $participant): JsonResponse
    {
        $allMembers = OpenTripParticipant::with('user:id,name')
            ->where('group_id', $participant->group_id)
            ->where('status', 'matched')
            ->get()
            ->map(fn($p) => [
                'participant_id' => $p->id,
                'user_id'        => $p->user_id,
                'name'           => $p->user->name,
                'payment_status' => $p->payment_status ?? 'unpaid',
                'is_me'          => $p->user_id === Auth::id(),
            ]);

        $paidCount   = $allMembers->where('payment_status', 'paid')->count();
        $totalCount  = $allMembers->count();

        return response()->json([
            'my_payment_status' => $participant->payment_status ?? 'unpaid',
            'paid_count'        => $paidCount,
            'total_count'       => $totalCount,
            'all_paid'          => $paidCount === $totalCount,
            'members'           => $allMembers,
        ]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // POST /api/open-trip/confirm
    // TC-056: Peserta konfirmasi keikutsertaan dalam window 6 jam setelah
    // countdown grup berakhir (expires_at sudah lewat, tapi belum > +6 jam).
    // ════════════════════════════════════════════════════════════════════════

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'participant_id' => ['required', 'integer'],
        ]);

        $participant = OpenTripParticipant::where('id', $request->integer('participant_id'))
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Harus sudah masuk grup (status matched)
        if ($participant->status !== 'matched' || ! $participant->group_id) {
            return response()->json([
                'message' => 'Kamu belum masuk ke grup Smart Open Trip.',
            ], 422);
        }

        $group = $participant->group;

        // Countdown harus sudah habis (expires_at sudah lewat)
        if ($group->isActive()) {
            return response()->json([
                'message' => 'Countdown belum berakhir. Konfirmasi akan tersedia setelah countdown habis.',
            ], 422);
        }

        // Window konfirmasi setelah countdown harus belum lewat
        $otConfirmMinutes     = config('booking.ot_confirm_timeout_minutes', 360);
        $confirmationDeadline = $group->expires_at->copy()->addMinutes($otConfirmMinutes);
        if (now()->greaterThan($confirmationDeadline)) {
            return response()->json([
                'message' => "Batas waktu konfirmasi ({$otConfirmMinutes} menit setelah countdown) sudah habis.",
            ], 422);
        }

        // Sudah konfirmasi sebelumnya
        if ($participant->confirmed_at !== null) {
            return response()->json([
                'message'       => 'Kamu sudah mengkonfirmasi keikutsertaan ini.',
                'confirmed_at'  => $participant->confirmed_at->toIso8601String(),
            ], 200);
        }

        $participant->update(['confirmed_at' => now()]);

        return response()->json([
            'message'      => 'Konfirmasi keikutsertaan berhasil dicatat.',
            'confirmed_at' => $participant->fresh()->confirmed_at->toIso8601String(),
        ], 200);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/debug-pool?tour_id=X&trip_date=Y   (SEMENTARA)
    // Dry-run: lihat pool & skor kompatibilitas tanpa ubah data apapun.
    // Hapus setelah bug ditemukan & diperbaiki.
    // ════════════════════════════════════════════════════════════════════════

    public function debugPool(Request $request): JsonResponse
    {
        $request->validate([
            'tour_id'   => ['required', 'integer', 'exists:tours,id'],
            'trip_date' => ['required', 'date_format:Y-m-d'],
        ]);

        $tourId    = $request->integer('tour_id');
        $tripDate  = $request->input('trip_date');

        // Semua peserta waiting di pool ini
        $waiting = OpenTripParticipant::with(['interests', 'preferences', 'user:id,name,email'])
            ->where('tour_id', $tourId)
            ->where('trip_date', $tripDate)
            ->where('status', 'waiting')
            ->orderBy('created_at', 'asc')
            ->get();

        // Semua peserta (tidak filter status) — untuk lihat apakah ada yang 'cancelled'/'matched'
        $allInPool = OpenTripParticipant::with(['user:id,name,email'])
            ->where('tour_id', $tourId)
            ->where('trip_date', $tripDate)
            ->get()
            ->map(fn($p) => [
                'id'         => $p->id,
                'user'       => $p->user?->email,
                'status'     => $p->status,
                'trip_date'  => $p->trip_date?->format('Y-m-d'),
                'tour_id'    => $p->tour_id,
                'group_id'   => $p->group_id,
            ]);

        $profiles = $waiting->map(fn($p) => [
            'participant_id' => $p->id,
            'user_email'     => $p->user?->email,
            'profile'        => $p->toProfileArray(),
            'trip_date_raw'  => $p->getRawOriginal('trip_date'),  // nilai asli di DB
            'tour_id'        => $p->tour_id,
        ]);

        // Hitung skor pasangan (semua kombinasi 2 peserta)
        $pairwiseScores = [];
        $waitingArr     = $waiting->values();

        for ($i = 0; $i < $waitingArr->count(); $i++) {
            for ($j = $i + 1; $j < $waitingArr->count(); $j++) {
                $p1 = $waitingArr[$i];
                $p2 = $waitingArr[$j];

                $groupProfile = $this->matcher->calculateGroupProfile(collect([$p1]));
                $score        = $this->matcher->calculateScore($p2->toProfileArray(), $groupProfile);

                $pairwiseScores[] = [
                    'p1' => ['id' => $p1->id, 'user' => $p1->user?->email],
                    'p2' => ['id' => $p2->id, 'user' => $p2->user?->email],
                    'acuan_dari_p1' => $groupProfile,
                    'skor_p2'        => $score['score'],
                    'match_count'    => $score['match_count'],
                    'criteria_match' => $score['criteria_match'],
                    'compatible'     => $score['compatible'],
                    'weights'        => $score['weights'],
                ];
            }
        }

        return response()->json([
            'query_params'    => ['tour_id' => $tourId, 'trip_date' => $tripDate],
            'all_in_pool'     => $allInPool,
            'waiting_count'   => $waiting->count(),
            'waiting_profiles'=> $profiles,
            'pairwise_scores' => $pairwiseScores,
            'verdict'         => $waiting->count() < 2
                ? 'POOL < 2 peserta — matching tidak akan jalan'
                : (collect($pairwiseScores)->where('compatible', true)->isNotEmpty()
                    ? 'ADA pasangan kompatibel — grup seharusnya terbentuk'
                    : 'TIDAK ADA pasangan kompatibel'),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/status?tour_id=X&trip_date=Y
    // ════════════════════════════════════════════════════════════════════════

    public function status(Request $request): JsonResponse
    {
        $request->validate([
            'tour_id'   => ['required', 'integer', 'exists:tours,id'],
            'trip_date' => ['required', 'date_format:Y-m-d'],
        ]);

        $participant = OpenTripParticipant::where('user_id', Auth::id())
            ->where('tour_id', $request->integer('tour_id'))
            ->where('trip_date', $request->input('trip_date'))
            ->whereIn('status', ['waiting', 'matched'])
            ->first();

        if (! $participant) {
            // Cek apakah peserta ini di-cancel oleh pemandu (grup punya rejected_at)
            $cancelledByGuide = OpenTripParticipant::where('user_id', Auth::id())
                ->where('tour_id', $request->integer('tour_id'))
                ->where('trip_date', $request->input('trip_date'))
                ->where('status', 'cancelled')
                ->whereNotNull('group_id')
                ->whereHas('group', fn($q) => $q->whereNotNull('rejected_at'))
                ->first();

            if ($cancelledByGuide) {
                return response()->json([
                    'status'  => 'cancelled_by_guide',
                    'message' => 'Grup Anda sebelumnya dibatalkan oleh pemandu wisata. Silakan pilih ulang tour atau tanggal yang berbeda untuk bergabung kembali ke Smart Open Trip.',
                ], 200);
            }

            // TC-057/058: peserta di-cancel oleh scheduler karena window konfirmasi habis
            $cancelledByTimeout = OpenTripParticipant::where('user_id', Auth::id())
                ->where('tour_id', $request->integer('tour_id'))
                ->where('trip_date', $request->input('trip_date'))
                ->where('status', 'cancelled')
                ->whereNotNull('group_id')
                ->whereHas('group', fn($q) => $q->whereNotNull('sot_processed_at')->whereNull('rejected_at'))
                ->first();

            if ($cancelledByTimeout) {
                return response()->json([
                    'status'  => 'cancelled_by_timeout',
                    'message' => 'Waktu konfirmasi habis dan grup diproses otomatis. Kamu tidak diikutsertakan karena tidak mengkonfirmasi dalam batas waktu.',
                ], 200);
            }

            return response()->json(['message' => 'Kamu belum terdaftar di pool ini.'], 404);
        }

        $response = [
            'participant_id' => $participant->id,
            'status'         => $participant->status,
            'group_id'       => $participant->group_id,
            'matching_score' => $participant->matching_score,
        ];

        if ($participant->status === 'matched' && $participant->group_id) {
            $group = $participant->group;
            $response['expires_at']        = $group->expires_at->toIso8601String();
            $response['seconds_remaining'] = $group->secondsRemaining();
        }

        return response()->json($response);
    }

    // ════════════════════════════════════════════════════════════════════════
    // GET /api/open-trip/group/{groupId}
    // ════════════════════════════════════════════════════════════════════════

    public function groupDetail(int $groupId): JsonResponse
    {
        $group = OpenTripGroup::with([
            'tour:id,name,tour_price,tour_location_id,tour_guide_id',
            'tour.location:id,name',
            'tour.guide:id,name,profile_picture,rating',
            'participants' => fn($q) => $q->with([
                'user:id,name,profile_photo_path',
                'interests:id,name',
                'preferences:id,name,category_id',
            ]),
        ])->findOrFail($groupId);

        $isMember = $group->participants->contains('user_id', Auth::id());
        if (! $isMember) {
            return response()->json(['message' => 'Kamu bukan anggota grup ini.'], 403);
        }

        $groupProfile = $this->matcher->calculateGroupProfile(
            $group->participants->map(fn($p) => $p->load(['interests', 'preferences']))
        );

        $members = $group->participants->map(function ($p) use ($groupProfile) {
            $scoreResult = $this->matcher->calculateScore(
                $p->toProfileArray(),
                $groupProfile
            );

            return [
                'participant_id'  => $p->id,
                'user_id'         => $p->user_id,
                'name'            => $p->user->name,
                'profile_picture' => $p->user->profile_photo_path,
                'age'             => $p->age,
                'budget_level'    => $p->budget_level,
                'interests'       => $p->interests->pluck('name'),
                'activities'      => $p->preferences->pluck('name'),
                'matching_score'  => $p->matching_score,
                'confirmed_at'   => $p->confirmed_at?->toIso8601String(),
                'status'         => $p->status,
                'score_detail'   => [
                    'weights'        => $scoreResult['weights'],
                    'ncf'            => $scoreResult['ncf'],
                    'nsf'            => $scoreResult['nsf'],
                    'score'          => $scoreResult['score'],
                    'criteria_match' => $scoreResult['criteria_match'],
                    'match_count'    => $scoreResult['match_count'],
                ],
            ];
        });

        $guide = $group->tour->guide;

        $otConfirmMinutes   = config('booking.ot_confirm_timeout_minutes', 360);
        $confirmDeadlineAt  = $group->expires_at->copy()->addMinutes($otConfirmMinutes);

        return response()->json([
            'group' => [
                'id'                     => $group->id,
                'tour_id'                => $group->tour_id,
                'tour_name'              => $group->tour->name,
                'tour_location'          => $group->tour->location?->name,
                'tour_price'             => $group->tour->tour_price,
                'trip_date'              => $group->trip_date->format('Y-m-d'),
                'matched_at'             => $group->matched_at->toIso8601String(),
                'expires_at'             => $group->expires_at->toIso8601String(),
                'confirm_deadline_at'    => $confirmDeadlineAt->toIso8601String(),
                'is_confirm_window_open' => ! $group->isActive()
                    && now()->lessThan($confirmDeadlineAt)
                    && $group->sot_processed_at === null,
                'is_processed'           => $group->sot_processed_at !== null,
                'seconds_remaining'      => $group->secondsRemaining(),
                'is_active'              => $group->isActive(),
                'member_count'           => $group->participants->count(),
            ],
            'guide' => $guide ? [
                'id'              => $guide->id,
                'name'            => $guide->name,
                'profile_picture' => $guide->profile_picture,
                'rating'          => $guide->rating,
            ] : null,
            'group_profile' => [
                'avg_age'          => round($groupProfile['age'], 1),
                'avg_budget_level' => round($groupProfile['budget_level'], 1),
                'interest_ids'     => $groupProfile['interest_ids'],
                'preference_ids'   => $groupProfile['preference_ids'],
            ],
            'members' => $members,
        ]);
    }
}

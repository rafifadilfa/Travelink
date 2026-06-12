<?php

namespace App\Services;

use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Models\Tour;
use App\Services\NotificationService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * OpenTripMatchingService
 *
 * Mengeksekusi algoritma "Greedy Sequential Group Formation" untuk Smart Open Trip.
 * Dipisahkan dari controller agar bisa dipanggil dari seeder, test, dan tempat lain.
 *
 * Referensi algoritma: docs/rancangan_profile_matching.md §6 + penjelasan di atas kode.
 */
class OpenTripMatchingService
{
    public function __construct(private ProfileMatchingService $matcher) {}

    // ════════════════════════════════════════════════════════════════════════
    // ENTRY POINT — dipanggil setiap kali peserta join pool
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Jalankan matching untuk semua peserta 'waiting' di pool (tour + tanggal).
     *
     * Algoritma: Greedy Sequential Group Formation
     * ─────────────────────────────────────────────
     * 1. Ambil semua peserta 'waiting', urut by created_at ASC
     *    (paling lama menunggu = anchor pertama)
     * 2. Anchor jadi "inti" grup sementara.
     * 3. Cek setiap peserta tersisa: jika kompatibel (match_count ≥ 2 dari 4 kriteria)
     *    terhadap group_profile grup sementara → masuk grup.
     *    Group_profile diperbarui setiap kali anggota baru ditambahkan (§4 dokumen).
     * 4. Jika grup sementara memiliki ≥ 2 anggota → grup terbentuk, countdown mulai.
     * 5. Sisa peserta yang tidak cocok diproses ulang di iterasi berikutnya.
     * 6. Batas maksimum anggota = config('open_trip.max_group_size').
     *
     * Properti penting:
     * - Tidak ada peserta yang masuk 2 grup sekaligus.
     * - Peserta 'matched' (sudah di grup) tidak ikut diproses ulang.
     *
     * @param  int    $tourId
     * @param  string $tripDate  Format: 'Y-m-d'
     * @return array  Ringkasan hasil: ['groups_formed' => N, 'details' => [...]]
     */
    public function runMatching(int $tourId, string $tripDate): array
    {
        $maxSize = config('open_trip.max_group_size', 6);

        // ── DEBUG LOG — hapus setelah bug terselesaikan ──────────────
        Log::debug('[OpenTrip] runMatching DIPANGGIL', [
            'tour_id'   => $tourId,
            'trip_date' => $tripDate,
        ]);

        $waiting = OpenTripParticipant::with(['interests', 'preferences'])
            ->where('tour_id', $tourId)
            ->where('trip_date', $tripDate)
            ->where('status', 'waiting')
            ->orderBy('created_at', 'asc')
            ->get();

        // ── DEBUG LOG — jumlah peserta ditemukan di pool ─────────────
        Log::debug('[OpenTrip] peserta waiting ditemukan: ' . $waiting->count(), [
            'peserta' => $waiting->map(fn($p) => [
                'id'         => $p->id,
                'user_id'    => $p->user_id,
                'tour_id'    => $p->tour_id,
                'trip_date'  => $p->trip_date?->format('Y-m-d'),
                'status'     => $p->status,
                'age'        => $p->age,
                'budget'     => $p->budget_level,
                'interests'  => $p->interests->pluck('id')->toArray(),
                'prefs'      => $p->preferences->pluck('id')->toArray(),
            ])->toArray(),
        ]);

        if ($waiting->count() < 2) {
            return ['groups_formed' => 0, 'details' => [], '_debug_waiting_count' => $waiting->count()];
        }

        $ungrouped    = $waiting->values();
        $groupsFormed = [];

        while ($ungrouped->count() >= 2) {
            $anchor    = $ungrouped->first();
            $ungrouped = $ungrouped->slice(1)->values();

            $groupMembers   = collect([$anchor]);
            $stillUngrouped = collect();

            foreach ($ungrouped as $candidate) {
                if ($groupMembers->count() >= $maxSize) {
                    $stillUngrouped->push($candidate);
                    continue;
                }

                $groupProfile = $this->matcher->calculateGroupProfile($groupMembers);
                $scoreResult  = $this->matcher->calculateScore(
                    $candidate->toProfileArray(),
                    $groupProfile
                );

                // ── DEBUG LOG — skor tiap kandidat ───────────────────
                Log::debug('[OpenTrip] skor kandidat #' . $candidate->id, [
                    'candidate_profile' => $candidate->toProfileArray(),
                    'group_profile'     => $groupProfile,
                    'score'             => $scoreResult['score'],
                    'match_count'       => $scoreResult['match_count'],
                    'criteria_match'    => $scoreResult['criteria_match'],
                    'compatible'        => $scoreResult['compatible'],
                ]);

                if ($scoreResult['compatible']) {
                    $groupMembers->push($candidate);
                } else {
                    $stillUngrouped->push($candidate);
                }
            }

            if ($groupMembers->count() >= 2) {
                $groupDetail    = $this->formGroup($groupMembers, $tourId, $tripDate);
                $groupsFormed[] = $groupDetail;
            } else {
                // Anchor tidak cocok dengan siapapun — kembalikan ke antrian
                $stillUngrouped->prepend($anchor);
            }

            $ungrouped = $stillUngrouped->values();

            if ($ungrouped->count() < 2) {
                break;
            }
        }

        Log::debug('[OpenTrip] runMatching SELESAI', [
            'groups_formed'         => count($groupsFormed),
            '_debug_waiting_count'  => $waiting->count(),
        ]);

        return [
            'groups_formed'        => count($groupsFormed),
            'details'              => $groupsFormed,
            '_debug_waiting_count' => $waiting->count(),
        ];
    }

    // ════════════════════════════════════════════════════════════════════════
    // INTERNAL — finalisasi satu grup
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Buat record OpenTripGroup, hitung skor akhir semua anggota, update status.
     *
     * Skor akhir dihitung terhadap group_profile FINAL (setelah semua anggota diketahui).
     * Ini memastikan skor yang ditampilkan di Tahap 2 konsisten dengan §5d dokumen.
     */
    private function formGroup(
        \Illuminate\Support\Collection $members,
        int $tourId,
        string $tripDate
    ): array {
        $countdownMinutes = config('open_trip.countdown_minutes', 2);
        $now              = Carbon::now();

        $result = [];

        DB::transaction(function () use ($members, $tourId, $tripDate, $now, $countdownMinutes, &$result) {
            $group = OpenTripGroup::create([
                'tour_id'    => $tourId,
                'trip_date'  => $tripDate,
                'matched_at' => $now,
                'expires_at' => $now->copy()->addMinutes($countdownMinutes),
            ]);

            // Profil acuan FINAL (semua anggota sudah diketahui)
            $finalProfile = $this->matcher->calculateGroupProfile($members);

            $memberDetails = [];
            foreach ($members as $member) {
                $scoreResult = $this->matcher->calculateScore(
                    $member->toProfileArray(),
                    $finalProfile
                );

                $member->update([
                    'status'         => 'matched',
                    'group_id'       => $group->id,
                    'matching_score' => $scoreResult['score'],
                ]);

                $memberDetails[] = [
                    'participant_id' => $member->id,
                    'user_id'        => $member->user_id,
                    'score'          => $scoreResult['score'],
                    'match_count'    => $scoreResult['match_count'],
                    'criteria_match' => $scoreResult['criteria_match'],
                    'weights'        => $scoreResult['weights'],
                    'ncf'            => $scoreResult['ncf'],
                    'nsf'            => $scoreResult['nsf'],
                ];
            }

            $result = [
                'group_id'       => $group->id,
                'member_count'   => $members->count(),
                'members'        => $memberDetails,
                'group_profile'  => $finalProfile,
            ];

            // TC-036: notifikasi pemandu pemilik paket — grup terbentuk
            $tour    = Tour::find($tourId);
            $guideId = $tour?->tour_guide_id;
            if ($guideId) {
                NotificationService::send(
                    'open_trip_group_formed',
                    'guide',
                    $guideId,
                    'Grup Open Trip Siap',
                    'Grup untuk paket ' . ($tour->name ?? 'wisata') . ' telah mencapai kuota minimum.',
                    ['group_id' => $group->id, 'tour_id' => $tourId]
                );
            }
        });

        return $result;
    }
}

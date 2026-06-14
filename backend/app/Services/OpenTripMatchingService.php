<?php

namespace App\Services;

use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Models\Tour;
use App\Services\NotificationService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Greedy Sequential Group Formation untuk Smart Open Trip.
 * Referensi: docs/rancangan_profile_matching.md §6
 */
class OpenTripMatchingService
{
    public function __construct(private ProfileMatchingService $matcher) {}

    // Jalankan matching pool (tour + tanggal). Dipanggil setiap kali peserta join.
    // Algoritma §6: anchor = peserta terlama waiting, iterasi greedy, grup terbentuk jika ≥ 2 anggota.
    public function runMatching(int $tourId, string $tripDate): array
    {
        $maxSize = config('open_trip.max_group_size', 6);

        $waiting = OpenTripParticipant::with(['interests', 'preferences'])
            ->where('tour_id', $tourId)
            ->where('trip_date', $tripDate)
            ->where('status', 'waiting')
            ->orderBy('created_at', 'asc')
            ->get();

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

        return [
            'groups_formed'        => count($groupsFormed),
            'details'              => $groupsFormed,
            '_debug_waiting_count' => $waiting->count(),
        ];
    }

    // Buat OpenTripGroup, hitung skor akhir terhadap group_profile FINAL (§5d), update status anggota.
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

<?php

namespace App\Services;

use Illuminate\Support\Collection;

/**
 * Profile Matching (Gap Analysis) untuk Smart Open Trip.
 * Profil acuan dihitung dinamis dari pool — semua peserta setara.
 * Referensi: docs/rancangan_profile_matching.md
 */
class ProfileMatchingService
{
    // Tabel konversi gap → bobot (§5b) — HARUS IDENTIK dengan laporan skripsi.
    // Gap 0 = tepat sama = 5.0. Gap ≥4 atau ≤-4 → bobot minimum 1.5.
    private const GAP_WEIGHT_TABLE = [
         0 => 5.0,   // tepat sama
         1 => 4.5,   // lebih 1
        -1 => 4.0,   // kurang 1
         2 => 3.5,   // lebih 2
        -2 => 3.0,   // kurang 2
         3 => 2.5,   // lebih 3
        -3 => 2.0,   // kurang 3
    ];

    /** Bobot minimum untuk gap yang sangat besar (|gap| ≥ 4) */
    private const GAP_WEIGHT_MIN = 1.5;

    // Bobot Core Factor & Secondary Factor (§5c)
    private const CORE_WEIGHT      = 0.60; // Minat + Preference (aktivitas lebih menentukan)
    private const SECONDARY_WEIGHT = 0.40; // Umur + Budget

    // Ambang batas "cocok" per kriteria (§3 & §6)
    private const AGE_MATCH_THRESHOLD    = 5;  // selisih umur ≤ 5 tahun
    private const BUDGET_MATCH_THRESHOLD = 1;  // selisih level budget ≤ 1

    // §5b — Langkah 1: Konversi gap ke bobot nilai
    public function gapToWeight(int $gap): float
    {
        return self::GAP_WEIGHT_TABLE[$gap] ?? self::GAP_WEIGHT_MIN;
    }

    // §5b — Langkah 2: Bobot kriteria NUMERIK (umur/budget). Gap dibulatkan sebelum masuk tabel.
    public function numericWeight(int|float $participantValue, float $referenceValue): float
    {
        $gap = (int) round($participantValue - $referenceValue);
        return $this->gapToWeight($gap);
    }

    // Bobot kriteria KATEGORI: ada irisan → 5.0 (gap=0), tidak ada → 1.0. Pool baru → 5.0.
    public function categoryWeight(array $participantIds, array $referenceIds): float
    {
        if (empty($referenceIds)) {
            return self::GAP_WEIGHT_TABLE[0]; // pool baru — bobot netral 5.0
        }

        $intersection = array_intersect($participantIds, $referenceIds);
        return count($intersection) > 0
            ? self::GAP_WEIGHT_TABLE[0]  // ada irisan = bobot 5.0
            : 1.0;                        // tidak ada irisan = bobot minimum
    }

    // §3 & §6 — Langkah 3: Cek apakah satu kriteria "cocok"

    // Cocok jika |participantAge - referenceAge| ≤ AGE_MATCH_THRESHOLD (5 tahun).
    public function isAgeMatch(int $participantAge, float $referenceAge): bool
    {
        return abs($participantAge - $referenceAge) <= self::AGE_MATCH_THRESHOLD;
    }

    // Cocok jika ada ≥ 1 irisan; peserta pertama (referenceIds kosong) selalu cocok.
    public function isInterestMatch(array $participantIds, array $referenceIds): bool
    {
        if (empty($referenceIds)) return true; // peserta pertama = selalu cocok
        return count(array_intersect($participantIds, $referenceIds)) > 0;
    }

    // Cocok jika ada ≥ 1 aktivitas yang sama (irisan tidak kosong).
    public function isPreferenceMatch(array $participantIds, array $referenceIds): bool
    {
        if (empty($referenceIds)) return true;
        return count(array_intersect($participantIds, $referenceIds)) > 0;
    }

    // Cocok jika |participantLevel - referenceLevel| ≤ BUDGET_MATCH_THRESHOLD (1 level).
    public function isBudgetMatch(int $participantLevel, float $referenceLevel): bool
    {
        return abs($participantLevel - $referenceLevel) <= self::BUDGET_MATCH_THRESHOLD;
    }

    // §4 — Langkah 4: Hitung profil acuan grup
    // §4: umur & budget = rata-rata; minat & preference = irisan (kosong → union). Return ['age', 'interest_ids', 'preference_ids', 'budget_level'].
    public function calculateGroupProfile(Collection $participants): array
    {
        if ($participants->isEmpty()) {
            return [
                'age'            => 0,
                'interest_ids'   => [],
                'preference_ids' => [],
                'budget_level'   => 0,
            ];
        }

        $avgAge    = $participants->avg('age');
        $avgBudget = $participants->avg('budget_level');

        $allInterestSets = $participants->map(
            fn($p) => $p->interests->pluck('id')->toArray()
        )->toArray();

        $allPreferenceSets = $participants->map(
            fn($p) => $p->preferences->pluck('id')->toArray()
        )->toArray();

        $interestIntersection   = $this->intersectAll($allInterestSets);
        $preferenceIntersection = $this->intersectAll($allPreferenceSets);

        // Irisan kosong → pakai union agar peserta baru tetap punya kesempatan cocok
        $referenceInterests   = empty($interestIntersection)
            ? array_unique(array_merge(...$allInterestSets))
            : $interestIntersection;

        $referencePreferences = empty($preferenceIntersection)
            ? array_unique(array_merge(...$allPreferenceSets))
            : $preferenceIntersection;

        return [
            'age'            => $avgAge,
            'interest_ids'   => array_values($referenceInterests),
            'preference_ids' => array_values($referencePreferences),
            'budget_level'   => $avgBudget,
        ];
    }

    // §5c & §5d — Langkah 5: Hitung skor kecocokan peserta terhadap profil grup
    // §5c & §5d: bobot tiap kriteria → NCF (minat+pref) + NSF (umur+budget) → score = 60%×NCF + 40%×NSF → cek match_count ≥ 2.
    public function calculateScore(array $participant, array $groupProfile): array
    {
        // Langkah 1: Bobot tiap kriteria
        $weightAge = $this->numericWeight(
            $participant['age'],
            $groupProfile['age']
        );

        $weightInterest = $this->categoryWeight(
            $participant['interest_ids'],
            $groupProfile['interest_ids']
        );

        $weightPreference = $this->categoryWeight(
            $participant['preference_ids'],
            $groupProfile['preference_ids']
        );

        $weightBudget = $this->numericWeight(
            $participant['budget_level'],
            $groupProfile['budget_level']
        );

        // Langkah 2: NCF = Core Factor (minat + preference)
        $ncf = ($weightInterest + $weightPreference) / 2;

        // Langkah 3: NSF = Secondary Factor (umur + budget)
        $nsf = ($weightAge + $weightBudget) / 2;

        // Langkah 4: Skor Total
        $score = (self::CORE_WEIGHT * $ncf) + (self::SECONDARY_WEIGHT * $nsf);

        // Langkah 5: Cek "cocok" per kriteria
        $matchAge = $this->isAgeMatch(
            $participant['age'],
            $groupProfile['age']
        );

        $matchInterest = $this->isInterestMatch(
            $participant['interest_ids'],
            $groupProfile['interest_ids']
        );

        $matchPreference = $this->isPreferenceMatch(
            $participant['preference_ids'],
            $groupProfile['preference_ids']
        );

        $matchBudget = $this->isBudgetMatch(
            $participant['budget_level'],
            $groupProfile['budget_level']
        );

        // Langkah 6: Jumlah kriteria cocok
        $criteriaMatch = [
            'age'        => $matchAge,
            'interest'   => $matchInterest,
            'preference' => $matchPreference,
            'budget'     => $matchBudget,
        ];

        $matchCount = count(array_filter($criteriaMatch));

        return [
            'weights' => [
                'age'        => $weightAge,
                'interest'   => $weightInterest,
                'preference' => $weightPreference,
                'budget'     => $weightBudget,
            ],
            'ncf'   => round($ncf, 4),
            'nsf'   => round($nsf, 4),
            'score' => round($score, 4),
            'criteria_match' => $criteriaMatch,
            'match_count'    => $matchCount,
            'compatible' => $matchCount >= 2, // §6: kompatibel = minimal 2 dari 4 kriteria cocok
        ];
    }

    // §6 — Langkah 6: Cek kompatibilitas (match_count ≥ 2 dari 4 kriteria)
    public function isCompatible(array $scoreResult): bool
    {
        return $scoreResult['compatible'];
    }

    // Irisan dari banyak array: [[1,2,3],[2,3,4],[3,4,5]] → [3]
    private function intersectAll(array $arrays): array
    {
        if (empty($arrays)) return [];
        if (count($arrays) === 1) return $arrays[0];

        return array_values(
            array_intersect(...$arrays)
        );
    }
}

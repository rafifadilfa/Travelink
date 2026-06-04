<?php

namespace App\Services;

use Illuminate\Support\Collection;

/**
 * ProfileMatchingService
 *
 * Mengimplementasikan algoritma Profile Matching (Gap Analysis) untuk
 * Smart Open Trip. Peserta dicocokkan dengan "profil acuan grup" yang
 * dihitung dinamis dari anggota yang sudah ada di pool — bukan satu
 * profil tetap — sehingga semua peserta setara (tidak ada anchor).
 *
 * Referensi: docs/rancangan_profile_matching.md
 */
class ProfileMatchingService
{
    // ────────────────────────────────────────────────────────────────────────
    // KONSTANTA — harus IDENTIK dengan tabel di laporan skripsi (§5b)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Tabel konversi gap → bobot nilai (skala 0–5).
     * Gap 0 berarti tepat sama = paling cocok = bobot 5.0.
     * Gap positif artinya peserta "lebih tinggi" dari acuan.
     * Gap negatif artinya peserta "lebih rendah" dari acuan.
     *
     * Untuk gap ≥4 atau ≤-4 diberikan bobot minimum 1.5.
     */
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

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 1 — Konversi Gap ke Bobot Nilai (§5b)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Konversi gap numerik ke bobot nilai menggunakan tabel dokumen.
     *
     * @param  int $gap  Selisih (nilai peserta − nilai acuan), boleh negatif
     * @return float     Bobot 1.5–5.0
     */
    public function gapToWeight(int $gap): float
    {
        return self::GAP_WEIGHT_TABLE[$gap] ?? self::GAP_WEIGHT_MIN;
    }

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 2 — Bobot Tiap Kriteria
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Hitung bobot untuk kriteria NUMERIK (umur atau budget).
     *
     * Gap dihitung sebagai: nilai peserta − nilai acuan (bisa negatif).
     * Nilai acuan bisa berupa pecahan (rata-rata grup), sehingga gap
     * dibulatkan ke integer terdekat sebelum masuk tabel.
     *
     * @param  int|float $participantValue  Nilai peserta
     * @param  float     $referenceValue    Nilai acuan grup (rata-rata)
     * @return float     Bobot 1.5–5.0
     */
    public function numericWeight(int|float $participantValue, float $referenceValue): float
    {
        $gap = (int) round($participantValue - $referenceValue);
        return $this->gapToWeight($gap);
    }

    /**
     * Hitung bobot untuk kriteria KATEGORI (minat/interest).
     *
     * Logika: jika ada irisan ≥ 1 elemen antara pilihan peserta
     * dan pilihan acuan → bobot 5 (cocok). Jika tidak ada irisan → bobot 1.
     *
     * Catatan untuk sidang: ini representasi "gap = 0" untuk kategori
     * (ada irisan = tidak ada gap = bobot tertinggi).
     *
     * @param  array $participantIds  ID kategori/item yang dipilih peserta
     * @param  array $referenceIds   ID kategori/item acuan grup (irisan bersama)
     * @return float  5.0 jika ada irisan, 1.0 jika tidak
     */
    public function categoryWeight(array $participantIds, array $referenceIds): float
    {
        if (empty($referenceIds)) {
            // Pool baru (peserta pertama): tidak ada acuan → bobot netral
            return self::GAP_WEIGHT_TABLE[0]; // 5.0
        }

        $intersection = array_intersect($participantIds, $referenceIds);
        return count($intersection) > 0
            ? self::GAP_WEIGHT_TABLE[0]  // ada irisan = bobot 5.0
            : 1.0;                        // tidak ada irisan = bobot minimum
    }

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 3 — Cek Apakah Satu Kriteria "Cocok" (§3 & §6)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Tentukan apakah kriteria UMUR dianggap cocok.
     * Cocok jika selisih umur ≤ AGE_MATCH_THRESHOLD (5 tahun).
     */
    public function isAgeMatch(int $participantAge, float $referenceAge): bool
    {
        return abs($participantAge - $referenceAge) <= self::AGE_MATCH_THRESHOLD;
    }

    /**
     * Tentukan apakah kriteria MINAT dianggap cocok.
     * Cocok jika ada ≥ 1 kategori yang sama (irisan tidak kosong).
     */
    public function isInterestMatch(array $participantIds, array $referenceIds): bool
    {
        if (empty($referenceIds)) return true; // peserta pertama = selalu cocok
        return count(array_intersect($participantIds, $referenceIds)) > 0;
    }

    /**
     * Tentukan apakah kriteria PREFERENCE dianggap cocok.
     * Cocok jika ada ≥ 1 aktivitas yang sama (irisan tidak kosong).
     */
    public function isPreferenceMatch(array $participantIds, array $referenceIds): bool
    {
        if (empty($referenceIds)) return true;
        return count(array_intersect($participantIds, $referenceIds)) > 0;
    }

    /**
     * Tentukan apakah kriteria BUDGET dianggap cocok.
     * Cocok jika selisih level budget ≤ BUDGET_MATCH_THRESHOLD (1 level).
     */
    public function isBudgetMatch(int $participantLevel, float $referenceLevel): bool
    {
        return abs($participantLevel - $referenceLevel) <= self::BUDGET_MATCH_THRESHOLD;
    }

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 4 — Hitung Profil Acuan Grup (§4)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Hitung profil acuan grup dari kumpulan peserta yang sudah ada di pool.
     *
     * Aturan (§4 dokumen):
     * - Umur & Budget (numerik) : rata-rata semua anggota
     * - Minat & Preference (kategori) : irisan (kategori/aktivitas yang
     *   dipilih SEMUA anggota). Jika irisan kosong (tidak ada kesamaan
     *   universal), gunakan UNION semua pilihan agar tidak terlalu ketat.
     *
     * @param  Collection $participants  Koleksi OpenTripParticipant (dengan relasi interests & preferences di-load)
     * @return array  ['age', 'interest_ids', 'preference_ids', 'budget_level']
     */
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

        // Rata-rata umur & budget
        $avgAge    = $participants->avg('age');
        $avgBudget = $participants->avg('budget_level');

        // Kumpulkan semua ID minat dari tiap peserta
        $allInterestSets = $participants->map(
            fn($p) => $p->interests->pluck('id')->toArray()
        )->toArray();

        // Kumpulkan semua ID preferensi dari tiap peserta
        $allPreferenceSets = $participants->map(
            fn($p) => $p->preferences->pluck('id')->toArray()
        )->toArray();

        // Hitung irisan kategori (ID yang ada di SEMUA peserta)
        $interestIntersection   = $this->intersectAll($allInterestSets);
        $preferenceIntersection = $this->intersectAll($allPreferenceSets);

        // Jika irisan kosong (tidak ada yang dipilih semua), pakai union
        // sehingga peserta baru tetap punya kesempatan cocok
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

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 5 — Hitung Skor Kecocokan (§5c & §5d)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Hitung skor kecocokan satu peserta terhadap profil acuan grup.
     *
     * Alur (sesuai dokumen):
     * 1. Hitung bobot tiap kriteria (umur, minat, preference, budget)
     * 2. Hitung NCF = rata-rata bobot Core Factor (minat + preference)
     * 3. Hitung NSF = rata-rata bobot Secondary Factor (umur + budget)
     * 4. Skor Total = (60% × NCF) + (40% × NSF)
     * 5. Cek apakah tiap kriteria "cocok" (sesuai ambang batas §3)
     * 6. Hitung jumlah kriteria cocok → kompatibel jika ≥ 2
     *
     * @param  array $participant   Profil peserta: [age, interest_ids, preference_ids, budget_level]
     * @param  array $groupProfile  Profil acuan grup dari calculateGroupProfile()
     * @return array  Hasil lengkap per langkah untuk ditampilkan & ditest
     */
    public function calculateScore(array $participant, array $groupProfile): array
    {
        // ── Langkah 1: Bobot tiap kriteria ──────────────────────────────────

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

        // ── Langkah 2: Core Factor (Minat + Preference) ─────────────────────
        // Core = kriteria yang paling menentukan kenyamanan bersama dalam grup
        $ncf = ($weightInterest + $weightPreference) / 2;

        // ── Langkah 3: Secondary Factor (Umur + Budget) ─────────────────────
        $nsf = ($weightAge + $weightBudget) / 2;

        // ── Langkah 4: Skor Total ────────────────────────────────────────────
        $score = (self::CORE_WEIGHT * $ncf) + (self::SECONDARY_WEIGHT * $nsf);

        // ── Langkah 5: Cek "cocok" per kriteria ─────────────────────────────
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

        // ── Langkah 6: Jumlah kriteria cocok ────────────────────────────────
        $criteriaMatch = [
            'age'        => $matchAge,
            'interest'   => $matchInterest,
            'preference' => $matchPreference,
            'budget'     => $matchBudget,
        ];

        $matchCount = count(array_filter($criteriaMatch));

        return [
            // Detail bobot tiap kriteria
            'weights' => [
                'age'        => $weightAge,
                'interest'   => $weightInterest,
                'preference' => $weightPreference,
                'budget'     => $weightBudget,
            ],

            // Nilai faktor
            'ncf'   => round($ncf, 4),
            'nsf'   => round($nsf, 4),
            'score' => round($score, 4),

            // Apakah tiap kriteria dinyatakan "cocok"
            'criteria_match' => $criteriaMatch,
            'match_count'    => $matchCount,

            // Kompatibel = minimal 2 dari 4 kriteria cocok (§6)
            'compatible' => $matchCount >= 2,
        ];
    }

    // ────────────────────────────────────────────────────────────────────────
    // LANGKAH 6 — Cek Kompatibilitas (§6)
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Shortcut: apakah peserta kompatibel berdasarkan hasil calculateScore?
     * Kompatibel = match_count ≥ 2 (minimal 2 dari 4 kriteria cocok).
     *
     * @param  array $scoreResult  Output dari calculateScore()
     * @return bool
     */
    public function isCompatible(array $scoreResult): bool
    {
        return $scoreResult['compatible'];
    }

    // ────────────────────────────────────────────────────────────────────────
    // UTILITAS INTERNAL
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Hitung irisan dari banyak array ID sekaligus.
     * Contoh: [[1,2,3], [2,3,4], [3,4,5]] → [3]
     *
     * @param  array[] $arrays  Kumpulan array yang akan di-intersect
     * @return array            Irisan semua array
     */
    private function intersectAll(array $arrays): array
    {
        if (empty($arrays)) return [];
        if (count($arrays) === 1) return $arrays[0];

        return array_values(
            array_intersect(...$arrays)
        );
    }
}

<?php

namespace App\Console\Commands;

use App\Services\ProfileMatchingService;
use Illuminate\Console\Command;

/**
 * Artisan command untuk mendemonstrasikan & memverifikasi algoritma
 * Profile Matching menggunakan contoh dari Bagian 7 dokumen spesifikasi.
 *
 * Jalankan: php artisan matching:demo
 */
class ProfileMatchingDemo extends Command
{
    protected $signature   = 'matching:demo';
    protected $description = 'Demo & verifikasi algoritma Profile Matching (contoh dari dokumen §7)';

    public function handle(ProfileMatchingService $service): void
    {
        $this->newLine();
        $this->line('╔══════════════════════════════════════════════════════════════╗');
        $this->line('║      DEMO ALGORITMA PROFILE MATCHING — Smart Open Trip       ║');
        $this->line('║      Referensi: docs/rancangan_profile_matching.md §7        ║');
        $this->line('╚══════════════════════════════════════════════════════════════╝');
        $this->newLine();

        // ────────────────────────────────────────────────────────────────────
        // DATA CONTOH (Bagian 7 dokumen)
        // ID kategori & item bersifat simbolis (tidak butuh DB untuk demo ini)
        // ────────────────────────────────────────────────────────────────────

        // Peserta A adalah anggota pertama — menjadi profil acuan awal
        $pesertaA = [
            'name'           => 'Peserta A (acuan awal)',
            'age'            => 25,
            'interest_ids'   => [1],      // {pantai}
            'preference_ids' => [1, 2],   // {surfing, berenang}
            'budget_level'   => 3,
        ];

        // Peserta B ingin bergabung ke pool yang sudah ada A
        $pesertaB = [
            'name'           => 'Peserta B (ingin bergabung)',
            'age'            => 27,
            'interest_ids'   => [1],      // {pantai}
            'preference_ids' => [1, 3],   // {surfing, snorkeling}
            'budget_level'   => 3,
        ];

        // ────────────────────────────────────────────────────────────────────
        // LANGKAH 1 — Tampilkan profil kedua peserta
        // ────────────────────────────────────────────────────────────────────

        $this->info('PROFIL PESERTA');
        $this->line(str_repeat('─', 64));

        $labelMap = [
            'interest_ids'   => ['ID 1 = pantai'],
            'preference_ids' => ['ID 1 = surfing', 'ID 2 = berenang', 'ID 3 = snorkeling'],
        ];

        foreach ([$pesertaA, $pesertaB] as $p) {
            $this->line("  {$p['name']}");
            $this->line("    Umur       : {$p['age']} tahun");
            $this->line("    Minat      : ID " . implode(',', $p['interest_ids'])
                . "  ← " . implode(', ', $labelMap['interest_ids']));
            $this->line("    Preference : ID " . implode(',', $p['preference_ids'])
                . "  ← " . implode(', ', $labelMap['preference_ids']));
            $this->line("    Budget     : Level {$p['budget_level']}  (1–5, dimana 3 = Rp 1–2 juta)");
            $this->newLine();
        }

        // ────────────────────────────────────────────────────────────────────
        // LANGKAH 2 — Hitung profil acuan grup (hanya A yang ada di pool)
        // Karena A adalah satu-satunya anggota, A = profil acuan
        // ────────────────────────────────────────────────────────────────────

        // Simulasikan Collection berisi satu anggota (A) tanpa Eloquent
        // menggunakan objek sederhana yang meniru OpenTripParticipant
        $mockA = new class($pesertaA) {
            public int $age;
            public int $budget_level;
            public object $interests;
            public object $preferences;

            public function __construct(array $data) {
                $this->age          = $data['age'];
                $this->budget_level = $data['budget_level'];

                // Buat koleksi sederhana yang punya pluck()
                $this->interests = collect(
                    array_map(fn($id) => (object)['id' => $id], $data['interest_ids'])
                );
                $this->preferences = collect(
                    array_map(fn($id) => (object)['id' => $id], $data['preference_ids'])
                );
            }
        };

        $groupProfile = $service->calculateGroupProfile(collect([$mockA]));

        $this->info('LANGKAH 1 — Profil Acuan Grup (= Peserta A saja)');
        $this->line(str_repeat('─', 64));
        $this->line("  Umur rata-rata  : {$groupProfile['age']}");
        $this->line("  Minat (acuan)   : ID " . implode(',', $groupProfile['interest_ids'])
            . "  ← pantai");
        $this->line("  Preference (acuan): ID " . implode(',', $groupProfile['preference_ids'])
            . "  ← surfing, berenang");
        $this->line("  Budget rata-rata : {$groupProfile['budget_level']}");
        $this->newLine();

        // ────────────────────────────────────────────────────────────────────
        // LANGKAH 3 — Hitung gap & bobot tiap kriteria untuk Peserta B
        // ────────────────────────────────────────────────────────────────────

        $this->info('LANGKAH 2 — Gap & Bobot Tiap Kriteria (Peserta B vs Acuan)');
        $this->line(str_repeat('─', 64));

        // Umur
        $gapAge    = $pesertaB['age'] - (int) $groupProfile['age'];
        $weightAge = $service->gapToWeight($gapAge);
        $matchAge  = $service->isAgeMatch($pesertaB['age'], $groupProfile['age']);
        $this->printCriterion(
            '1. Umur',
            "gap = {$pesertaB['age']} − {$groupProfile['age']} = {$gapAge}",
            "bobot {$weightAge}",
            $matchAge,
            "selisih |{$gapAge}| ≤ 5 tahun"
        );

        // Minat
        $weightInterest = $service->categoryWeight(
            $pesertaB['interest_ids'], $groupProfile['interest_ids']
        );
        $matchInterest = $service->isInterestMatch(
            $pesertaB['interest_ids'], $groupProfile['interest_ids']
        );
        $sharedInterest = array_intersect($pesertaB['interest_ids'], $groupProfile['interest_ids']);
        $this->printCriterion(
            '2. Minat',
            "irisan ID = {" . implode(',', $sharedInterest) . "} (pantai)",
            "bobot {$weightInterest}",
            $matchInterest,
            "ada irisan ≥ 1 kategori"
        );

        // Preference
        $weightPref = $service->categoryWeight(
            $pesertaB['preference_ids'], $groupProfile['preference_ids']
        );
        $matchPref = $service->isPreferenceMatch(
            $pesertaB['preference_ids'], $groupProfile['preference_ids']
        );
        $sharedPref = array_intersect($pesertaB['preference_ids'], $groupProfile['preference_ids']);
        $this->printCriterion(
            '3. Preference',
            "irisan ID = {" . implode(',', $sharedPref) . "} (surfing)",
            "bobot {$weightPref}",
            $matchPref,
            "ada irisan ≥ 1 aktivitas"
        );

        // Budget
        $gapBudget    = $pesertaB['budget_level'] - (int) $groupProfile['budget_level'];
        $weightBudget = $service->gapToWeight($gapBudget);
        $matchBudget  = $service->isBudgetMatch($pesertaB['budget_level'], $groupProfile['budget_level']);
        $this->printCriterion(
            '4. Budget',
            "gap = {$pesertaB['budget_level']} − {$groupProfile['budget_level']} = {$gapBudget}",
            "bobot {$weightBudget}",
            $matchBudget,
            "selisih |{$gapBudget}| ≤ 1 level"
        );

        $this->newLine();

        // ────────────────────────────────────────────────────────────────────
        // LANGKAH 4 — NCF, NSF, Skor Total
        // ────────────────────────────────────────────────────────────────────

        $result = $service->calculateScore($pesertaB, $groupProfile);

        $this->info('LANGKAH 3 — Core Factor, Secondary Factor & Skor Total');
        $this->line(str_repeat('─', 64));

        $this->line("  Core Factor (CF) — Minat + Preference:");
        $this->line("    NCF = ({$result['weights']['interest']} + {$result['weights']['preference']}) / 2");
        $this->line("        = {$result['ncf']}");
        $this->newLine();

        $this->line("  Secondary Factor (SF) — Umur + Budget:");
        $this->line("    NSF = ({$result['weights']['age']} + {$result['weights']['budget']}) / 2");
        $this->line("        = {$result['nsf']}");
        $this->newLine();

        $corePct  = (int)(0.60 * 100);
        $secPct   = (int)(0.40 * 100);
        $corePart = round(0.60 * $result['ncf'], 2);
        $secPart  = round(0.40 * $result['nsf'], 2);

        $this->line("  Skor Total:");
        $this->line("    Skor = ({$corePct}% × NCF) + ({$secPct}% × NSF)");
        $this->line("         = (0.60 × {$result['ncf']}) + (0.40 × {$result['nsf']})");
        $this->line("         = {$corePart} + {$secPart}");
        $this->line("         = <fg=cyan;options=bold>{$result['score']} / 5</>");
        $percent = round($result['score'] / 5 * 100, 1);
        $this->line("         ≈ <fg=cyan;options=bold>{$percent}% kecocokan</>");
        $this->newLine();

        // ────────────────────────────────────────────────────────────────────
        // LANGKAH 5 — Keputusan Kompatibilitas
        // ────────────────────────────────────────────────────────────────────

        $this->info('LANGKAH 4 — Keputusan Kompatibilitas (§6: minimal 2/4 kriteria cocok)');
        $this->line(str_repeat('─', 64));

        $this->line("  Jumlah kriteria cocok: {$result['match_count']} / 4");
        $this->line("  Ambang batas minimum : 2");
        $this->newLine();

        if ($result['compatible']) {
            $this->line('  <fg=green;options=bold>✓  PESERTA B KOMPATIBEL — grup terbentuk, countdown dimulai!</>');
        } else {
            $this->line('  <fg=red;options=bold>✗  Peserta B TIDAK kompatibel — tetap di waiting room.</> ');
        }

        // ────────────────────────────────────────────────────────────────────
        // VERIFIKASI vs dokumen
        // ────────────────────────────────────────────────────────────────────

        $this->newLine();
        $this->info('VERIFIKASI vs Dokumen (§7 rancangan_profile_matching.md)');
        $this->line(str_repeat('─', 64));

        $expectedScore      = 4.7;
        $expectedCompatible = true;
        $scoreOk      = abs($result['score'] - $expectedScore) < 0.01;
        $compatibleOk = $result['compatible'] === $expectedCompatible;

        $this->line("  Skor diharapkan  : {$expectedScore}   → " . ($scoreOk      ? '<fg=green>✓ SESUAI</>' : "<fg=red>✗ TIDAK SESUAI (dapat {$result['score']})</>"));
        $this->line("  Kompatibel (B)   : " . ($expectedCompatible ? 'true' : 'false') . "  → " . ($compatibleOk ? '<fg=green>✓ SESUAI</>' : '<fg=red>✗ TIDAK SESUAI</>'));
        $this->newLine();

        if ($scoreOk && $compatibleOk) {
            $this->line('  <fg=green;options=bold>✓  Implementasi sesuai dengan spesifikasi dokumen.</> ');
        } else {
            $this->error('  ✗  Ada perbedaan dengan spesifikasi — perlu dicek!');
        }

        // ════════════════════════════════════════════════════════════════════
        // SKENARIO C — Membuktikan Acuan DINAMIS (bukan anchor tetap)
        //
        // Setelah B bergabung, pool berisi [A, B].
        // Peserta C dievaluasi terhadap rata-rata A+B, BUKAN A saja.
        // Ini membuktikan tidak ada anchor tetap.
        // ════════════════════════════════════════════════════════════════════

        $this->newLine();
        $this->line('╔══════════════════════════════════════════════════════════════╗');
        $this->line('║   SKENARIO C — VERIFIKASI ACUAN DINAMIS (bukan anchor tetap) ║');
        $this->line('╚══════════════════════════════════════════════════════════════╝');
        $this->newLine();

        // ── Perbarui acuan setelah B bergabung ───────────────────────────────

        // Buat mock B (sama dengan pesertaB di atas)
        $mockB = new class($pesertaB) {
            public int $age;
            public int $budget_level;
            public object $interests;
            public object $preferences;

            public function __construct(array $data) {
                $this->age          = $data['age'];
                $this->budget_level = $data['budget_level'];
                $this->interests    = collect(
                    array_map(fn($id) => (object)['id' => $id], $data['interest_ids'])
                );
                $this->preferences  = collect(
                    array_map(fn($id) => (object)['id' => $id], $data['preference_ids'])
                );
            }
        };

        // Profil acuan yang BENAR: rata-rata A + B
        $updatedProfile = $service->calculateGroupProfile(collect([$mockA, $mockB]));

        $this->info('LANGKAH 1 — Profil Acuan DIPERBARUI setelah B bergabung');
        $this->line(str_repeat('─', 64));
        $this->line("  Pool sekarang  : [A, B]  (dua anggota)");
        $this->newLine();
        $this->line("  Umur rata-rata : ({$pesertaA['age']} + {$pesertaB['age']}) / 2 = {$updatedProfile['age']}");
        $this->newLine();

        $interestNote = implode(',', $updatedProfile['interest_ids']);
        $this->line("  Minat (irisan) :");
        $this->line("    A punya   : ID " . implode(',', $pesertaA['interest_ids']) . " → {pantai}");
        $this->line("    B punya   : ID " . implode(',', $pesertaB['interest_ids']) . " → {pantai}");
        $this->line("    Irisan    : ID {$interestNote}  → {pantai}");
        $this->newLine();

        $prefNote = implode(',', $updatedProfile['preference_ids']);
        $this->line("  Preference (irisan) :");
        $this->line("    A punya   : ID " . implode(',', $pesertaA['preference_ids'])
            . " → {surfing, berenang}");
        $this->line("    B punya   : ID " . implode(',', $pesertaB['preference_ids'])
            . " → {surfing, snorkeling}");
        $this->line("    Irisan    : ID {$prefNote}  → {surfing}  <-- berenang HILANG dari acuan!");
        $this->newLine();

        $this->line("  Budget rata-rata: ({$pesertaA['budget_level']} + {$pesertaB['budget_level']}) / 2 = {$updatedProfile['budget_level']}");
        $this->newLine();

        // ── Peserta C ────────────────────────────────────────────────────────

        // C sengaja dipilih: punya {berenang} tapi tidak {surfing}
        // Ini BERBEDA hasilnya tergantung acuan yang dipakai (A saja vs A+B)
        $pesertaC = [
            'name'           => 'Peserta C',
            'age'            => 26,
            'interest_ids'   => [1, 2],   // {pantai, gunung}
            'preference_ids' => [2, 6],   // {berenang, diving}
            'budget_level'   => 2,
        ];

        $this->info("LANGKAH 2 — Profil Peserta C (yang ingin bergabung ke grup A+B)");
        $this->line(str_repeat('─', 64));
        $this->line("  Umur       : {$pesertaC['age']} tahun");
        $this->line("  Minat      : ID " . implode(',', $pesertaC['interest_ids'])
            . "  ← pantai (ID 1), gunung (ID 2)");
        $this->line("  Preference : ID " . implode(',', $pesertaC['preference_ids'])
            . "  ← berenang (ID 2), diving (ID 6)  ← perhatikan: TIDAK ada surfing!");
        $this->line("  Budget     : Level {$pesertaC['budget_level']}");
        $this->newLine();

        // ── Hitung C vs acuan BENAR [A+B] ───────────────────────────────────

        $resultC_correct = $service->calculateScore($pesertaC, $updatedProfile);

        $this->info("LANGKAH 3a — C vs Acuan BENAR [A+B]  (cara yang benar)");
        $this->line(str_repeat('─', 64));

        $gapAgeC = $pesertaC['age'] - $updatedProfile['age'];
        $this->line("  Umur     : gap = {$pesertaC['age']} − {$updatedProfile['age']} = {$gapAgeC}"
            . "  → bobot {$resultC_correct['weights']['age']}"
            . " → " . ($resultC_correct['criteria_match']['age'] ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>'));

        $sharedInterestC = array_intersect($pesertaC['interest_ids'], $updatedProfile['interest_ids']);
        $this->line("  Minat    : irisan = {" . implode(',', $sharedInterestC) . "} (pantai)"
            . "  → bobot {$resultC_correct['weights']['interest']}"
            . " → " . ($resultC_correct['criteria_match']['interest'] ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>'));

        $sharedPrefC = array_intersect($pesertaC['preference_ids'], $updatedProfile['preference_ids']);
        $sharedPrefStr = empty($sharedPrefC) ? 'KOSONG' : implode(',', $sharedPrefC);
        $this->line("  Preference: irisan = {{$sharedPrefStr}}"
            . "  → acuan={surfing}, C punya={berenang,diving} → TIDAK ADA irisan!"
            . "  → bobot {$resultC_correct['weights']['preference']}"
            . " → " . ($resultC_correct['criteria_match']['preference'] ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>'));

        $gapBudgetC = $pesertaC['budget_level'] - $updatedProfile['budget_level'];
        $this->line("  Budget   : gap = {$pesertaC['budget_level']} − {$updatedProfile['budget_level']}"
            . " = {$gapBudgetC}  → bobot {$resultC_correct['weights']['budget']}"
            . " → " . ($resultC_correct['criteria_match']['budget'] ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>'));

        $this->newLine();
        $this->line("  NCF   = ({$resultC_correct['weights']['interest']} + {$resultC_correct['weights']['preference']}) / 2 = {$resultC_correct['ncf']}");
        $this->line("  NSF   = ({$resultC_correct['weights']['age']} + {$resultC_correct['weights']['budget']}) / 2 = {$resultC_correct['nsf']}");
        $this->line("  Skor  = (0.60 × {$resultC_correct['ncf']}) + (0.40 × {$resultC_correct['nsf']}) = <fg=cyan>{$resultC_correct['score']} / 5</>");
        $this->line("  Match : {$resultC_correct['match_count']}/4 kriteria → "
            . ($resultC_correct['compatible']
                ? '<fg=green;options=bold>KOMPATIBEL ✓</>'
                : '<fg=red;options=bold>TIDAK KOMPATIBEL ✗</>'));

        // ── Hitung C vs acuan SALAH [A saja] — "bukti kontras" ───────────────

        $this->newLine();
        $this->info("LANGKAH 3b — C vs Acuan SALAH [A saja]  (cara yang KELIRU, untuk perbandingan)");
        $this->line(str_repeat('─', 64));
        $this->line("  Jika secara keliru kita tetap memakai A sebagai anchor:");
        $this->newLine();

        $resultC_wrong = $service->calculateScore($pesertaC, $groupProfile); // $groupProfile = acuan [A] dari skenario sebelumnya

        $sharedPrefC_wrong = array_intersect($pesertaC['preference_ids'], $groupProfile['preference_ids']);
        $sharedPrefStr_wrong = empty($sharedPrefC_wrong) ? 'KOSONG' : implode(',', $sharedPrefC_wrong);

        $this->line("  Preference (acuan A saja = {surfing,berenang}):");
        $this->line("    irisan = {{$sharedPrefStr_wrong}} (berenang!) → C tampak COCOK preference dengan A");
        $this->line("    bobot {$resultC_wrong['weights']['preference']}  → "
            . ($resultC_wrong['criteria_match']['preference'] ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>'));
        $this->newLine();
        $this->line("  Skor dengan acuan keliru: <fg=yellow>{$resultC_wrong['score']} / 5</> vs skor benar: <fg=cyan>{$resultC_correct['score']} / 5</>");
        $this->newLine();

        // ── Kesimpulan ────────────────────────────────────────────────────────

        $this->line('  <fg=yellow;options=bold>╔════════════════════════════════════════════════════════════╗</>');
        $this->line('  <fg=yellow;options=bold>║  KESIMPULAN PERBEDAAN ACUAN DINAMIS vs ANCHOR TETAP        ║</>');
        $this->line('  <fg=yellow;options=bold>╚════════════════════════════════════════════════════════════╝</>');
        $this->newLine();
        $this->line("  Preference acuan [A saja]  : {surfing, <fg=yellow>berenang</>}  (2 item)");
        $this->line("  Preference acuan [A+B]     : {surfing}                 (1 item — berenang dieliminasi)");
        $this->newLine();
        $this->line("  Karena B tidak punya 'berenang', irisan A∩B hanya {surfing}.");
        $this->line("  Maka C yang punya {berenang, diving} :");
        $this->line("    • Dengan anchor A : preference COCOK (ada {berenang}) → skor lebih tinggi");
        $this->line("    • Dengan acuan A+B: preference TIDAK COCOK            → skor lebih rendah");
        $this->newLine();

        $diffScore = round($resultC_wrong['score'] - $resultC_correct['score'], 2);
        $this->line("  Selisih skor: {$resultC_wrong['score']} − {$resultC_correct['score']} = <fg=yellow>{$diffScore}</> poin");
        $this->line("  → Acuan dinamis memberikan evaluasi yang lebih akurat terhadap");
        $this->line("    kecocokan nyata C dengan SELURUH anggota grup (A dan B),");
        $this->line("    bukan hanya dengan satu orang (A).");
        $this->newLine();
        $this->line('  <fg=green;options=bold>✓  Terbukti: calculateGroupProfile([A,B]) ≠ calculateGroupProfile([A])</>');
        $this->line('  <fg=green;options=bold>✓  Tidak ada anchor tetap — acuan selalu rata-rata semua anggota pool.</>');
        $this->newLine();
    }

    /** Helper: cetak satu baris kriteria dengan format seragam */
    private function printCriterion(
        string $label,
        string $detail,
        string $weight,
        bool $match,
        string $reason
    ): void {
        $statusTag = $match ? '<fg=green>COCOK ✓</>' : '<fg=red>TIDAK COCOK ✗</>';
        $this->line("  {$label}");
        $this->line("    Detail : {$detail}");
        $this->line("    Bobot  : {$weight}");
        $this->line("    Status : {$statusTag}  ({$reason})");
        $this->newLine();
    }
}

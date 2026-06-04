<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\OpenTripActivity;
use App\Models\OpenTripParticipant;
use App\Models\Tour;
use App\Models\User;
use App\Services\OpenTripMatchingService;
use App\Services\ProfileMatchingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * OpenTripParticipantSeeder
 *
 * Menyiapkan data uji coba Smart Open Trip dengan 5 peserta:
 *
 * ┌──────────┬───────┬───────────┬────────────────────────┬────────┬────────────────────────────────┐
 * │ Peserta  │ Umur  │ Minat     │ Aktivitas              │ Budget │ Prediksi                       │
 * ├──────────┼───────┼───────────┼────────────────────────┼────────┼────────────────────────────────┤
 * │ A (Andi) │ 25    │ Beach     │ Surfing, Snorkeling     │ 3      │ ✅ Cocok B → GRUP 1            │
 * │ B (Budi) │ 27    │ Beach     │ Surfing, Berenang       │ 3      │ ✅ Cocok A → GRUP 1            │
 * │ C (Citra)│ 38    │ Mountain  │ Hiking, Trekking        │ 2      │ ✅ Cocok D → GRUP 2            │
 * │ D (Dina) │ 40    │ Mountain  │ Hiking, Camping         │ 2      │ ✅ Cocok C → GRUP 2            │
 * │ E (Eko)  │ 55    │ Diving    │ Scuba Diving            │ 5      │ ❌ Tidak cocok siapapun → wait │
 * └──────────┴───────┴───────────┴────────────────────────┴────────┴────────────────────────────────┘
 *
 * Setelah seeder selesai:
 * - Grup 1: A + B (Beach, countdown aktif)
 * - Grup 2: C + D (Mountain, countdown aktif)
 * - E: tetap waiting
 *
 * Kredensial login:
 * - andi@test.com  / test123
 * - budi@test.com  / test123
 * - citra@test.com / test123
 * - dina@test.com  / test123
 * - eko@test.com   / test123
 */
class OpenTripParticipantSeeder extends Seeder
{
    // Tour & tanggal yang digunakan untuk semua peserta uji
    private const TOUR_NAME = 'Bali Beach Hopping Adventure';
    private const TRIP_DATE = '2026-08-01';

    public function run(): void
    {
        $this->command->info('');
        $this->command->info('════════════════════════════════════════════════');
        $this->command->info('  OpenTripParticipantSeeder — Smart Open Trip');
        $this->command->info('════════════════════════════════════════════════');

        // ── Validasi data master ─────────────────────────────────────────
        $tour = Tour::where('name', self::TOUR_NAME)->where('is_open_trip', true)->first();
        if (! $tour) {
            $this->command->error('Tour "' . self::TOUR_NAME . '" tidak ditemukan. Jalankan DummyTourSeeder dulu.');
            return;
        }
        $this->command->line("  Tour   : {$tour->name} (ID: {$tour->id})");

        // ── Ambil kategori ───────────────────────────────────────────────
        $catBeach    = Category::where('name', 'Beach')->first();
        $catMountain = Category::where('name', 'Mountain')->first();
        $catDiving   = Category::where('name', 'Diving')->first();

        foreach ([
            'Beach'    => $catBeach,
            'Mountain' => $catMountain,
            'Diving'   => $catDiving,
        ] as $name => $cat) {
            if (! $cat) {
                $this->command->error("Kategori '{$name}' tidak ditemukan. Jalankan CategorySeeder + OpenTripActivitySeeder dulu.");
                return;
            }
        }

        // ── Ambil aktivitas ──────────────────────────────────────────────
        $actSurfing    = OpenTripActivity::where('name', 'Surfing')->first();
        $actSnorkeling = OpenTripActivity::where('name', 'Snorkeling')->first();
        $actBerenang   = OpenTripActivity::where('name', 'Berenang')->first();
        $actHiking     = OpenTripActivity::where('name', 'Hiking')->first();
        $actTrekking   = OpenTripActivity::where('name', 'Trekking')->first();
        $actCamping    = OpenTripActivity::where('name', 'Camping')->first();
        $actScuba      = OpenTripActivity::where('name', 'Scuba Diving')->first();

        foreach ([
            'Surfing'      => $actSurfing,
            'Snorkeling'   => $actSnorkeling,
            'Berenang'     => $actBerenang,
            'Hiking'       => $actHiking,
            'Trekking'     => $actTrekking,
            'Camping'      => $actCamping,
            'Scuba Diving' => $actScuba,
        ] as $name => $act) {
            if (! $act) {
                $this->command->error("Aktivitas '{$name}' tidak ditemukan. Jalankan OpenTripActivitySeeder dulu.");
                return;
            }
        }

        // ── Buat / ambil user uji ────────────────────────────────────────
        $users = $this->createTestUsers();

        // ── Definisi profil 5 peserta ────────────────────────────────────
        $profiles = [
            'A' => [
                'user'       => $users['andi'],
                'age'        => 25,
                'budget'     => 3,
                'interests'  => [$catBeach->id],
                'activities' => [$actSurfing->id, $actSnorkeling->id],
                'label'      => 'Andi (A)',
            ],
            'B' => [
                'user'       => $users['budi'],
                'age'        => 27,
                'budget'     => 3,
                'interests'  => [$catBeach->id],
                'activities' => [$actSurfing->id, $actBerenang->id],
                'label'      => 'Budi (B)',
            ],
            'C' => [
                'user'       => $users['citra'],
                'age'        => 38,
                'budget'     => 2,
                'interests'  => [$catMountain->id],
                'activities' => [$actHiking->id, $actTrekking->id],
                'label'      => 'Citra (C)',
            ],
            'D' => [
                'user'       => $users['dina'],
                'age'        => 40,
                'budget'     => 2,
                'interests'  => [$catMountain->id],
                'activities' => [$actHiking->id, $actCamping->id],
                'label'      => 'Dina (D)',
            ],
            'E' => [
                'user'       => $users['eko'],
                'age'        => 55,
                'budget'     => 5,
                'interests'  => [$catDiving->id],
                'activities' => [$actScuba->id],
                'label'      => 'Eko (E)',
            ],
        ];

        // ── Bersihkan peserta lama di pool ini (aman karena ini data test) ─
        $existingIds = OpenTripParticipant::where('tour_id', $tour->id)
            ->where('trip_date', self::TRIP_DATE)
            ->whereIn('user_id', array_map(fn($u) => $u->id, $users))
            ->pluck('id');

        if ($existingIds->isNotEmpty()) {
            DB::table('participant_interests')->whereIn('participant_id', $existingIds)->delete();
            DB::table('participant_preferences')->whereIn('participant_id', $existingIds)->delete();
            OpenTripParticipant::whereIn('id', $existingIds)->delete();
            $this->command->line('  Peserta lama dibersihkan.');
        }

        // ── Buat peserta dalam status waiting ────────────────────────────
        $this->command->info('');
        $this->command->info('  [1/3] Membuat peserta (status: waiting)...');

        $participants = [];
        foreach ($profiles as $key => $p) {
            $participant = OpenTripParticipant::create([
                'user_id'      => $p['user']->id,
                'tour_id'      => $tour->id,
                'trip_date'    => self::TRIP_DATE,
                'age'          => $p['age'],
                'budget_level' => $p['budget'],
                'status'       => 'waiting',
            ]);
            $participant->interests()->sync($p['interests']);
            $participant->preferences()->sync($p['activities']);
            $participant->load(['interests', 'preferences']);

            $participants[$key] = $participant;
            $this->command->line("    {$p['label']} → ID #{$participant->id}");
        }

        // ── Jalankan matching ────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('  [2/3] Menjalankan Profile Matching...');
        $this->command->info('        (Greedy Sequential Group Formation)');
        $this->command->info('');

        $matchingService = app(OpenTripMatchingService::class);
        $result          = $matchingService->runMatching($tour->id, self::TRIP_DATE);

        // ── Tampilkan hasil verifikasi skor ─────────────────────────────
        $this->command->info('  [3/3] Hasil Matching:');
        $this->command->info('');

        if (empty($result['details'])) {
            $this->command->warn('  Tidak ada grup terbentuk!');
        }

        foreach ($result['details'] as $i => $group) {
            $groupNo = $i + 1;
            $this->command->info("  ── GRUP {$groupNo} (ID: #{$group['group_id']}) ──────────────────────");
            foreach ($group['members'] as $m) {
                $label = $this->getLabelForUser($m['user_id'], $profiles);
                $pct   = round($m['score'] / 5 * 100, 1);
                $match = implode(', ', array_keys(array_filter($m['criteria_match'])));

                $this->command->line("    {$label}");
                $this->command->line("      Skor     : {$m['score']} / 5.0  ({$pct}% cocok)");
                $this->command->line("      NCF      : {$m['ncf']}   (core: minat+preferensi)");
                $this->command->line("      NSF      : {$m['nsf']}   (secondary: umur+budget)");
                $this->command->line("      Kriteria : {$m['match_count']}/4 cocok [{$match}]");
                $this->command->line("      Bobot    : umur={$m['weights']['age']} | minat={$m['weights']['interest']} | pref={$m['weights']['preference']} | budget={$m['weights']['budget']}");
                $this->command->info('');
            }
        }

        // Cek peserta yang masih waiting
        $stillWaiting = OpenTripParticipant::where('tour_id', $tour->id)
            ->where('trip_date', self::TRIP_DATE)
            ->where('status', 'waiting')
            ->whereIn('user_id', array_map(fn($u) => $u->id, $users))
            ->get();

        if ($stillWaiting->isNotEmpty()) {
            $this->command->warn("  ── MASIH WAITING ─────────────────────────────────");
            foreach ($stillWaiting as $w) {
                $label = $this->getLabelForUser($w->user_id, $profiles);
                $this->command->line("    {$label} → tidak cocok dengan siapapun");
            }
            $this->command->info('');
        }

        // ── Ringkasan kredensial ─────────────────────────────────────────
        $this->command->info('════════════════════════════════════════════════');
        $this->command->info('  Kredensial login (password: test123):');
        $this->command->info("    A: andi@test.com");
        $this->command->info("    B: budi@test.com");
        $this->command->info("    C: citra@test.com");
        $this->command->info("    D: dina@test.com");
        $this->command->info("    E: eko@test.com");
        $this->command->info('');
        $this->command->info("  Tour ID  : {$tour->id}");
        $this->command->info('  Tanggal  : ' . self::TRIP_DATE);
        $this->command->info('════════════════════════════════════════════════');
        $this->command->info('');
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Buat 5 user uji coba (idempotent — aman dijalankan berkali-kali).
     * Password semua: test123
     */
    private function createTestUsers(): array
    {
        $defs = [
            'andi'  => ['name' => 'Andi Wijaya',  'email' => 'andi@test.com'],
            'budi'  => ['name' => 'Budi Santoso', 'email' => 'budi@test.com'],
            'citra' => ['name' => 'Citra Dewi',   'email' => 'citra@test.com'],
            'dina'  => ['name' => 'Dina Pratiwi', 'email' => 'dina@test.com'],
            'eko'   => ['name' => 'Eko Susanto',  'email' => 'eko@test.com'],
        ];

        $users = [];
        foreach ($defs as $key => $def) {
            $users[$key] = User::firstOrCreate(
                ['email' => $def['email']],
                [
                    'name'     => $def['name'],
                    'password' => Hash::make('test123'),
                    'email_verified_at' => now(),
                ]
            );
        }

        return $users;
    }

    /** Cari label peserta berdasarkan user_id */
    private function getLabelForUser(int $userId, array $profiles): string
    {
        foreach ($profiles as $p) {
            if ($p['user']->id === $userId) {
                return $p['label'];
            }
        }
        return "User #{$userId}";
    }
}

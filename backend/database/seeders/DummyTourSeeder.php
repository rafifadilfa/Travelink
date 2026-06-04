<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Country;
use App\Models\DayPhase;
use App\Models\Guide;
use App\Models\Location;
use App\Models\MeetingPoint;
use App\Models\PhoneCountryCode;
use App\Models\Tour;
use App\Models\TourImage;
use Illuminate\Database\Seeder;

/**
 * DummyTourSeeder — self-sufficient, idempotent.
 *
 * Membuat semua data yang dibutuhkan dari nol tanpa bergantung pada seeder lain
 * dan tanpa menghapus data yang sudah ada (semua pakai firstOrCreate/updateOrCreate).
 *
 * Aman dijalankan berkali-kali.
 */
class DummyTourSeeder extends Seeder
{
    public function run(): void
    {
        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 1 — Country Indonesia
        // ═══════════════════════════════════════════════════════════════
        $indonesia = Country::firstOrCreate(
            ['ISO_code_2' => 'ID'],
            ['country_name' => 'Indonesia']
        );
        $this->command->line("  Country   : {$indonesia->country_name} (ID: {$indonesia->id})");

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 2 — Phone country code +62
        // ═══════════════════════════════════════════════════════════════
        $phoneCode = PhoneCountryCode::firstOrCreate(
            ['phone_country_code' => '+62'],
            ['country_id' => $indonesia->id]
        );
        $this->command->line("  PhoneCode : {$phoneCode->phone_country_code} (ID: {$phoneCode->id})");

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 3 — DayPhase (Morning & Afternoon)
        // ═══════════════════════════════════════════════════════════════
        $morning = DayPhase::firstOrCreate(
            ['name' => 'Morning'],
            ['description' => 'Periode Waktu di antara 5 AM sampai 12 PM.']
        );
        $afternoon = DayPhase::firstOrCreate(
            ['name' => 'Afternoon'],
            ['description' => 'Periode Waktu di antara 12 PM sampai 5 PM.']
        );
        $this->command->line("  DayPhase  : Morning (ID: {$morning->id}), Afternoon (ID: {$afternoon->id})");

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 4 — Locations
        // ═══════════════════════════════════════════════════════════════
        $locationNames = ['Bali', 'Lombok', 'Jakarta', 'Yogyakarta'];
        $locations = [];
        foreach ($locationNames as $name) {
            $locations[$name] = Location::firstOrCreate(
                ['name' => $name],
                ['country_id' => $indonesia->id]
            );
        }
        $locationIds = implode(', ', array_map(fn($l) => "{$l->name}(#{$l->id})", $locations));
        $this->command->line("  Locations : {$locationIds}");

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 5 — Meeting Points
        // ═══════════════════════════════════════════════════════════════
        $meetingPointDefs = [
            'Hotel Lobby Central'        => $locations['Bali'],
            'Lombok Main Harbor, Pier B' => $locations['Lombok'],
            'Monas statue entrance'      => $locations['Jakarta'],
            'Parkiran Candi Prambanan'   => $locations['Yogyakarta'],
        ];

        $mps = [];
        foreach ($meetingPointDefs as $mpName => $location) {
            $mps[$mpName] = MeetingPoint::firstOrCreate(
                ['name' => $mpName],
                ['location_id' => $location->id]
            );
        }
        $this->command->line("  MeetingPts: " . implode(', ', array_keys($mps)));

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 6 — Guide Sarah Johnson (verified)
        // ═══════════════════════════════════════════════════════════════
        $guide = Guide::updateOrCreate(
            ['email' => 'sarah.johnson@example.com'],
            [
                'name'                  => 'Sarah Johnson',
                'password'              => bcrypt('sarah123'),
                'phone_number'          => '082112345678',
                'about'                 => 'Pemandu wisata profesional dengan pengalaman 5+ tahun di Bali. Spesialisasi tour budaya, pantai, dan aktivitas air.',
                'experience_years'      => 5,
                'verification_status'   => 'verified',
                'rating'                => 4.9,
                'email_verified_at'     => now(),
                'country_id'            => $indonesia->id,
                'phone_country_code_id' => $phoneCode->id,
                'profile_picture'       => null,
            ]
        );
        $this->command->line("  Guide     : {$guide->name} — {$guide->verification_status} (ID: {$guide->id})");

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 7 — Pastikan kategori tersedia
        // ═══════════════════════════════════════════════════════════════
        $catNames = ['Beach', 'City', 'Diving', 'Mountain', 'Cultural', 'Nature'];
        $cats = [];
        foreach ($catNames as $cn) {
            $cats[$cn] = Category::firstOrCreate(['name' => $cn]);
        }

        // ═══════════════════════════════════════════════════════════════
        // LANGKAH 8 — Tours (6 tour dummy)
        // ═══════════════════════════════════════════════════════════════
        $tourDefs = [
            // ── 3 SMART OPEN TRIP ────────────────────────────────────────
            [
                'tour' => [
                    'name'                  => 'Bali Beach Hopping Adventure',
                    'tour_location_id'      => $locations['Bali']->id,
                    'tour_meeting_point_id' => $mps['Hotel Lobby Central']->id,
                    'tour_description'      => 'Jelajahi pantai-pantai tersembunyi Bali bersama pemandu lokal kami. Dari Seminyak hingga Nusa Dua, nikmati snorkeling, bersantai di tepi pantai, dan foto-foto terbaik di spot yang jarang diketahui wisatawan biasa.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 1200000,
                    'tour_duration'         => 8,
                    'tour_start_time'       => '2000-01-01 08:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 10,
                    'tour_min_participants' => 2,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => true,
                    'is_open_trip'          => true,
                ],
                'image'      => 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
                'categories' => ['Beach'],
            ],
            [
                'tour' => [
                    'name'                  => 'Bali Temple & Culture Tour',
                    'tour_location_id'      => $locations['Bali']->id,
                    'tour_meeting_point_id' => $mps['Hotel Lobby Central']->id,
                    'tour_description'      => 'Rasakan keagungan budaya Bali melalui kunjungan ke Pura Tanah Lot, Pura Uluwatu, dan pasar seni Ubud. Termasuk sesi singkat pembuatan canang sari bersama keluarga Bali asli.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 950000,
                    'tour_duration'         => 6,
                    'tour_start_time'       => '2000-01-01 07:30:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 8,
                    'tour_min_participants' => 2,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => true,
                    'is_open_trip'          => true,
                ],
                'image'      => 'https://images.unsplash.com/photo-1531778272849-d1dd22444c06?w=800',
                'categories' => ['Cultural'],
            ],
            [
                'tour' => [
                    'name'                  => 'Gili Islands Snorkeling Day Trip',
                    'tour_location_id'      => $locations['Lombok']->id,
                    'tour_meeting_point_id' => $mps['Lombok Main Harbor, Pier B']->id,
                    'tour_description'      => 'Seharian penuh menjelajahi tiga Gili (Air, Meno, Trawangan) dengan perahu tradisional. Snorkeling di spot penyu, menikmati kelapa muda langsung dari pohon, dan menyaksikan sunset Gili yang legendaris.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 1500000,
                    'tour_duration'         => 9,
                    'tour_start_time'       => '2000-01-01 07:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 12,
                    'tour_min_participants' => 2,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => true,
                    'is_open_trip'          => true,
                ],
                'image'      => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
                'categories' => ['Diving', 'Beach'],
            ],
            // ── 3 PRIVATE TRIP ───────────────────────────────────────────
            [
                'tour' => [
                    'name'                  => 'Borobudur Sunrise & Prambanan',
                    'tour_location_id'      => $locations['Yogyakarta']->id,
                    'tour_meeting_point_id' => $mps['Parkiran Candi Prambanan']->id,
                    'tour_description'      => 'Saksikan matahari terbit di Candi Borobudur — momen yang tidak akan terlupakan. Dilanjutkan dengan kunjungan ke Candi Prambanan serta makan siang di restoran lokal dengan pemandangan sawah.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 900000,
                    'tour_duration'         => 7,
                    'tour_start_time'       => '2000-01-01 04:30:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 6,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => false,
                    'is_open_trip'          => false,
                ],
                'image'      => 'https://images.unsplash.com/photo-1631340729644-8b8aad1e9dba?w=800',
                'categories' => ['Cultural'],
            ],
            [
                'tour' => [
                    'name'                  => 'Jakarta Old Town Heritage Walk',
                    'tour_location_id'      => $locations['Jakarta']->id,
                    'tour_meeting_point_id' => $mps['Monas statue entrance']->id,
                    'tour_description'      => 'Telusuri sejarah Batavia di kawasan Kota Tua Jakarta. Kunjungi Museum Fatahillah, naik sepeda onthel di sekitar alun-alun, dan cicipi kuliner legendaris seperti kerak telor dan bir pletok.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 750000,
                    'tour_duration'         => 4,
                    'tour_start_time'       => '2000-01-01 09:00:00',
                    'tour_period_id'        => $afternoon->id,
                    'tour_max_participants' => 10,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => false,
                    'is_open_trip'          => false,
                ],
                'image'      => 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800',
                'categories' => ['City'],
            ],
            [
                'tour' => [
                    'name'                  => 'Mount Rinjani Base Camp Trek',
                    'tour_location_id'      => $locations['Lombok']->id,
                    'tour_meeting_point_id' => $mps['Lombok Main Harbor, Pier B']->id,
                    'tour_description'      => 'Pendakian satu hari ke kaki Gunung Rinjani melalui jalur Senaru. Nikmati hutan tropis lebat, air terjun Sendang Gile, dan panorama puncak Rinjani dari base camp. Cocok untuk pendaki pemula yang ingin merasakan keagungan gunung berapi aktif kedua tertinggi di Indonesia.',
                    'tour_guide_id'         => $guide->id,
                    'tour_price'            => 2500000,
                    'tour_duration'         => 12,
                    'tour_start_time'       => '2000-01-01 05:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 8,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => false,
                    'is_open_trip'          => false,
                ],
                'image'      => 'https://images.unsplash.com/photo-1726030040596-a8cad43c5363?w=800',
                'categories' => ['Mountain', 'Nature'],
            ],
        ];

        $created = 0;
        $updated = 0;
        foreach ($tourDefs as $def) {
            $tourData   = $def['tour'];
            $imageUrl   = $def['image'];
            $catNames   = $def['categories'];
            $name       = $tourData['name'];

            $existing = Tour::withTrashed()->where('name', $name)->first();

            if ($existing) {
                if ($existing->trashed()) {
                    $existing->restore();
                }
                $existing->update($tourData);
                $tourModel = $existing;
                $updated++;
            } else {
                $tourModel = Tour::create($tourData);
                $created++;
            }

            // Seed gambar pertama (upsert berdasarkan tour_id + image_order = 1)
            TourImage::updateOrCreate(
                ['tour_id' => $tourModel->id, 'image_order' => 1],
                ['image_path' => $imageUrl, 'image_caption' => $tourData['name']]
            );

            // Attach kategori (sync agar idempotent)
            $catIds = collect($catNames)
                ->map(fn($n) => $cats[$n]->id)
                ->filter()
                ->all();
            $tourModel->categories()->sync($catIds);
        }

        // Update jumlah tour di profil guide
        $guide->update(['total_tours' => Tour::where('tour_guide_id', $guide->id)->count()]);

        // ── Ringkasan ─────────────────────────────────────────────────────
        $totalTours = Tour::count();
        $openTrips  = Tour::where('is_open_trip', true)->count();

        $this->command->info('');
        $this->command->info('════════════════════════════════════════');
        $this->command->info('DummyTourSeeder selesai:');
        $this->command->info("  Tour dibuat baru  : {$created}");
        $this->command->info("  Tour diperbarui   : {$updated}");
        $this->command->info("  Total tour di DB  : {$totalTours}");
        $this->command->info("  Open Trip         : {$openTrips}");
        $this->command->info("  Private Trip      : " . ($totalTours - $openTrips));
        $this->command->info("  Pemilik tour      : {$guide->name} (ID: {$guide->id})");
        $this->command->info('════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('URL test Smart Open Trip:');

        foreach (Tour::where('is_open_trip', true)->get() as $t) {
            $this->command->info("  /open-trip/join/{$t->id}?date=2026-08-01  →  {$t->name}");
        }
        $this->command->info('');
    }
}

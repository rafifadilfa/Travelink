<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Booking;
use App\Models\Category;
use App\Models\Country;
use App\Models\DayPhase;
use App\Models\Guide;
use App\Models\GuideReview;
use App\Models\Location;
use App\Models\MeetingPoint;
use App\Models\OpenTripActivity;
use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Models\PhoneCountryCode;
use App\Models\Tour;
use App\Models\TourAvailability;
use App\Models\TourImage;
use App\Models\TourReview;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * BbtDataSeeder — Data uji untuk Black Box Testing Travelink (76 TC).
 *
 * Aman dijalankan berkali-kali (idempotent via updateOrCreate / firstOrCreate).
 * Jalankan dengan: php artisan db:seed --class=BbtDataSeeder
 *
 * Kredensial utama:
 *   Tourist   : ahmad@mail.com          / Ahmad1234!
 *   Guide Aktif: pemandu@mail.com        / Pemandu123!
 *   Guide Baru : pemandu_baru@mail.com   / PemanduBaru123!
 *   Guide KYC  : pemandu_kyc@mail.com    / PemanduKyc123!
 *   Admin      : admin@travelink.id      / Admin2024!
 */
class BbtDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════════╗');
        $this->command->info('║          BBT Data Seeder — Travelink (76 TC)            ║');
        $this->command->info('╚══════════════════════════════════════════════════════════╝');

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 0 — Data referensi wajib
        // ═══════════════════════════════════════════════════════════════════
        [$indonesia, $phoneCode, $morning] = $this->ensureReferenceData();

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 1 — Akun pengguna
        // ═══════════════════════════════════════════════════════════════════
        $ahmad    = $this->seedTourist($indonesia, $phoneCode);
        $admin    = $this->seedAdmin();
        $guides   = $this->seedGuides($indonesia, $phoneCode);

        $pemandu     = $guides['pemandu'];
        $pemanduBaru = $guides['pemandu_baru'];
        $pemanduKyc  = $guides['pemandu_kyc'];

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 2 — Paket wisata
        // ═══════════════════════════════════════════════════════════════════
        $tours = $this->seedTours($pemandu, $morning);

        $tourBaliSunset    = $tours['bali_sunset'];
        $tourJakartaKulin  = $tours['jakarta_kuliner'];
        $tourLombokSnork   = $tours['lombok_snorkeling'];
        $tourYogya         = $tours['yogyakarta'];
        $tourBaliSOT       = $tours['bali_sot'];

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 3 — Booking & Transaksi (wisatawan Ahmad)
        // ═══════════════════════════════════════════════════════════════════
        $this->seedBookings($ahmad, $pemandu, $tourBaliSunset, $tourLombokSnork);

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 4 — Smart Open Trip scenarios
        // ═══════════════════════════════════════════════════════════════════
        $this->seedSmartOTScenarios($ahmad, $tourBaliSOT);

        // ═══════════════════════════════════════════════════════════════════
        // BAGIAN 5 — Keuangan & Pencairan
        // ═══════════════════════════════════════════════════════════════════
        $this->seedFinancial($pemandu, $admin);

        // ═══════════════════════════════════════════════════════════════════
        // RINGKASAN KREDENSIAL
        // ═══════════════════════════════════════════════════════════════════
        $this->printSummary($ahmad, $pemandu, $pemanduBaru, $pemanduKyc, $admin);
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 0 — Referensi data
    // ────────────────────────────────────────────────────────────────────────

    private function ensureReferenceData(): array
    {
        $indonesia = Country::firstOrCreate(
            ['ISO_code_2' => 'ID'],
            ['country_name' => 'Indonesia']
        );

        $phoneCode = PhoneCountryCode::firstOrCreate(
            ['phone_country_code' => '+62'],
            ['country_id' => $indonesia->id]
        );

        $morning = DayPhase::firstOrCreate(
            ['name' => 'Morning'],
            ['description' => 'Periode Waktu di antara 5 AM sampai 12 PM.']
        );

        // Pastikan lokasi tersedia
        foreach (['Bali', 'Jakarta', 'Lombok', 'Yogyakarta'] as $loc) {
            Location::firstOrCreate(['name' => $loc], ['country_id' => $indonesia->id]);
        }

        // Pastikan kategori tersedia
        foreach (['Beach', 'City', 'Diving', 'Mountain', 'Cultural', 'Nature'] as $cat) {
            Category::firstOrCreate(['name' => $cat]);
        }

        $this->command->line('  [0] Referensi data: OK');

        return [$indonesia, $phoneCode, $morning];
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 1 — Akun pengguna
    // ────────────────────────────────────────────────────────────────────────

    private function seedTourist($indonesia, $phoneCode): User
    {
        // TC-002, TC-006, TC-009, TC-012–014, TC-041–046, TC-047–050, TC-059–062
        $ahmad = User::updateOrCreate(
            ['email' => 'ahmad@mail.com'],
            [
                'name'                  => 'Ahmad Fauzi',
                'password'              => Hash::make('Ahmad1234!'),
                'email_verified_at'     => now(),
                'phone_number'          => '081234567890',
                'phone_country_code_id' => $phoneCode->id,
            ]
        );

        $this->command->line("  [1] Tourist     : {$ahmad->name} ({$ahmad->email}) ID #{$ahmad->id}");
        return $ahmad;
    }

    private function seedAdmin(): Admin
    {
        // TC-008, TC-023, TC-024, TC-073–076
        $admin = Admin::updateOrCreate(
            ['email' => 'admin@travelink.id'],
            [
                'name'     => 'Admin Travelink',
                'password' => Hash::make('Admin2024!'),
            ]
        );

        $this->command->line("  [1] Admin       : {$admin->name} ({$admin->email}) ID #{$admin->id}");
        return $admin;
    }

    private function seedGuides($indonesia, $phoneCode): array
    {
        // TC-007, TC-025–027, TC-028–033, TC-043–044, TC-063–068
        $pemandu = Guide::updateOrCreate(
            ['email' => 'pemandu@mail.com'],
            [
                'name'                  => 'Pemandu Wisata',
                'password'              => Hash::make('Pemandu123!'),
                'phone_number'          => '082198765432',
                'about'                 => 'Pemandu wisata berpengalaman 8 tahun di Indonesia. Spesialisasi tour budaya, pantai, dan petualangan alam.',
                'experience_years'      => 8,
                'verification_status'   => 'verified',
                'rating'                => 4.7,
                'email_verified_at'     => now(),
                'country_id'            => $indonesia->id,
                'phone_country_code_id' => $phoneCode->id,
                'profile_picture'       => null,
                'base_rate'             => 500000,
                'bank_name'             => 'BCA',
                'bank_account_number'   => '1234567890',
                'bank_account_holder'   => 'Pemandu Wisata',
                'pending_balance'       => 750000,
                'available_balance'     => 5000000,
            ]
        );

        // TC-018: Pemandu baru yang belum diverifikasi (akses terbatas, banner KYC tampil)
        $pemanduBaru = Guide::updateOrCreate(
            ['email' => 'pemandu_baru@mail.com'],
            [
                'name'                  => 'Pemandu Baru',
                'password'              => Hash::make('PemanduBaru123!'),
                'phone_number'          => '085199988877',
                'about'                 => null,
                'experience_years'      => 0,
                'verification_status'   => 'unverified',
                'rating'                => 0,
                'email_verified_at'     => now(),
                'country_id'            => $indonesia->id,
                'phone_country_code_id' => $phoneCode->id,
                'profile_picture'       => null,
                'base_rate'             => null,
                'bank_name'             => null,
                'bank_account_number'   => null,
                'bank_account_holder'   => null,
                'pending_balance'       => 0,
                'available_balance'     => 0,
                'ktp_document'          => null,
                'selfie_ktp_document'   => null,
                'certificate_document'  => null,
                'portfolio_document'    => null,
            ]
        );

        // TC-022, TC-023, TC-024: Pemandu dengan KYC sudah diupload, menunggu persetujuan admin
        $pemanduKyc = Guide::updateOrCreate(
            ['email' => 'pemandu_kyc@mail.com'],
            [
                'name'                  => 'Pemandu KYC Pending',
                'password'              => Hash::make('PemanduKyc123!'),
                'phone_number'          => '089988776655',
                'about'                 => 'Pemandu wisata lokal dengan pengalaman 3 tahun di Bali.',
                'experience_years'      => 3,
                'verification_status'   => 'menunggu_verifikasi',
                'rating'                => 0,
                'email_verified_at'     => now(),
                'country_id'            => $indonesia->id,
                'phone_country_code_id' => $phoneCode->id,
                'profile_picture'       => null,
                'base_rate'             => 400000,
                'bank_name'             => 'Mandiri',
                'bank_account_number'   => '9876543210',
                'bank_account_holder'   => 'Pemandu KYC',
                'pending_balance'       => 0,
                'available_balance'     => 0,
                // Simulasi: dokumen sudah diupload tapi path dummy (belum ada file fisiknya)
                'ktp_document'          => 'kyc/bbt_ktp_pemandu_kyc.jpg',
                'selfie_ktp_document'   => 'kyc/bbt_selfie_pemandu_kyc.jpg',
                'certificate_document'  => null,
                'portfolio_document'    => null,
                'rejection_reason'      => null,
            ]
        );

        $this->command->line("  [1] Guide Aktif : {$pemandu->name} (ID #{$pemandu->id})");
        $this->command->line("  [1] Guide Baru  : {$pemanduBaru->name} (ID #{$pemanduBaru->id}, {$pemanduBaru->verification_status})");
        $this->command->line("  [1] Guide KYC   : {$pemanduKyc->name} (ID #{$pemanduKyc->id}, {$pemanduKyc->verification_status})");

        return [
            'pemandu'      => $pemandu,
            'pemandu_baru' => $pemanduBaru,
            'pemandu_kyc'  => $pemanduKyc,
        ];
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 2 — Paket wisata
    // ────────────────────────────────────────────────────────────────────────

    private function seedTours(Guide $pemandu, DayPhase $morning): array
    {
        $locBali    = Location::where('name', 'Bali')->first();
        $locJakarta = Location::where('name', 'Jakarta')->first();
        $locLombok  = Location::where('name', 'Lombok')->first();
        $locYogya   = Location::where('name', 'Yogyakarta')->first();

        $mpBali    = MeetingPoint::firstOrCreate(
            ['name' => 'Hotel Lobby Kuta Bali'],
            ['location_id' => $locBali->id]
        );
        $mpJakarta = MeetingPoint::firstOrCreate(
            ['name' => 'Halte Transjakarta Kota'],
            ['location_id' => $locJakarta->id]
        );
        $mpLombok  = MeetingPoint::firstOrCreate(
            ['name' => 'Dermaga Bangsal Lombok'],
            ['location_id' => $locLombok->id]
        );
        $mpYogya   = MeetingPoint::firstOrCreate(
            ['name' => 'Parkiran Malioboro'],
            ['location_id' => $locYogya->id]
        );

        $catBeach    = Category::where('name', 'Beach')->first();
        $catCity     = Category::where('name', 'City')->first();
        $catDiving   = Category::where('name', 'Diving')->first();
        $catMountain = Category::where('name', 'Mountain')->first();
        $catCultural = Category::where('name', 'Cultural')->first();

        $tourDefs = [
            // ─────────────────────────────────────────────────────────────────
            // T1: Bali Sunset Tour — Private
            // TC-028 base, TC-031 edit, TC-032 hapus (tidak ada booking aktif pada tour lain),
            // TC-035 cari "Bali", TC-039 pilih tanggal, TC-043/044 konfirmasi pemandu
            // Availability: Senin(1), Kamis(4), Sabtu(6)
            // ─────────────────────────────────────────────────────────────────
            'bali_sunset' => [
                'data' => [
                    'name'                  => 'Bali Sunset Tour',
                    'tour_description'      => 'Nikmati keindahan sunset Bali yang memukau di Tanah Lot dan Uluwatu. Tour private dengan pemandu lokal berpengalaman, termasuk makan malam seafood tepi pantai.',
                    'tour_guide_id'         => $pemandu->id,
                    'tour_location_id'      => $locBali->id,
                    'tour_meeting_point_id' => $mpBali->id,
                    'tour_price'            => 750000,
                    'tour_duration'         => 6,
                    'tour_start_time'       => '2000-01-01 14:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 10,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 4.5,
                    'featured'              => true,
                    'is_open_trip'          => false,
                ],
                'availability' => [1, 4, 6], // Senin, Kamis, Sabtu
                'categories'   => [$catBeach->id, $catCultural->id],
                'image'        => 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
            ],

            // ─────────────────────────────────────────────────────────────────
            // T2: Wisata Kuliner Jakarta — Private, NO availability
            // TC-036 filter harga 200k-500k, TC-037 search tidak ditemukan,
            // TC-040 tidak ada jadwal tersedia
            // ─────────────────────────────────────────────────────────────────
            'jakarta_kuliner' => [
                'data' => [
                    'name'                  => 'Wisata Kuliner Jakarta',
                    'tour_description'      => 'Jelajahi kuliner legendaris Jakarta: sate Senayan, nasi goreng Kebon Sirih, dan es krim Ragusa. Tur malam yang tak terlupakan bersama pemandu lokal yang ramah.',
                    'tour_guide_id'         => $pemandu->id,
                    'tour_location_id'      => $locJakarta->id,
                    'tour_meeting_point_id' => $mpJakarta->id,
                    'tour_price'            => 350000,
                    'tour_duration'         => 4,
                    'tour_start_time'       => '2000-01-01 18:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 8,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => false,
                    'is_open_trip'          => false,
                ],
                'availability' => [], // Tidak ada jadwal — TC-040
                'categories'   => [$catCity->id],
                'image'        => 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800',
            ],

            // ─────────────────────────────────────────────────────────────────
            // T3: Lombok Snorkeling Adventure — Private
            // TC-033 tidak bisa dihapus (ada booking aktif),
            // TC-036 filter harga 200k-500k
            // Availability: Rabu(3), Minggu(0)
            // ─────────────────────────────────────────────────────────────────
            'lombok_snorkeling' => [
                'data' => [
                    'name'                  => 'Lombok Snorkeling Adventure',
                    'tour_description'      => 'Snorkeling di perairan jernih Lombok bersama penyu dan ikan tropis warna-warni. Termasuk peralatan snorkeling, makan siang di atas kapal, dan pemandu bersertifikat.',
                    'tour_guide_id'         => $pemandu->id,
                    'tour_location_id'      => $locLombok->id,
                    'tour_meeting_point_id' => $mpLombok->id,
                    'tour_price'            => 450000,
                    'tour_duration'         => 7,
                    'tour_start_time'       => '2000-01-01 08:00:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 12,
                    'tour_min_participants' => 2,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => false,
                    'is_open_trip'          => false,
                ],
                'availability' => [3, 0], // Rabu, Minggu
                'categories'   => [$catDiving->id, $catBeach->id],
                'image'        => 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
            ],

            // ─────────────────────────────────────────────────────────────────
            // T4: Yogyakarta Heritage Tour — Private
            // TC-034 featured content di beranda
            // Availability: Sabtu(6), Minggu(0)
            // ─────────────────────────────────────────────────────────────────
            'yogyakarta' => [
                'data' => [
                    'name'                  => 'Yogyakarta Heritage Tour',
                    'tour_description'      => 'Jelajahi warisan budaya Yogyakarta: Kraton, Tamansari, dan Pasar Beringharjo. Termasuk kunjungan studio batik dan makan siang tradisional gudeg.',
                    'tour_guide_id'         => $pemandu->id,
                    'tour_location_id'      => $locYogya->id,
                    'tour_meeting_point_id' => $mpYogya->id,
                    'tour_price'            => 800000,
                    'tour_duration'         => 8,
                    'tour_start_time'       => '2000-01-01 08:30:00',
                    'tour_period_id'        => $morning->id,
                    'tour_max_participants' => 8,
                    'tour_min_participants' => 1,
                    'tour_status'           => 'published',
                    'tour_rating'           => 0,
                    'featured'              => true,
                    'is_open_trip'          => false,
                ],
                'availability' => [6, 0], // Sabtu, Minggu
                'categories'   => [$catCultural->id],
                'image'        => 'https://images.unsplash.com/photo-1631340729644-8b8aad1e9dba?w=800',
            ],

            // ─────────────────────────────────────────────────────────────────
            // T5: Bali Smart Open Trip — Open Trip
            // TC-051, TC-052, TC-053–058 skenario SOT
            // Availability: Senin(1), Rabu(3), Jumat(5)
            // ─────────────────────────────────────────────────────────────────
            'bali_sot' => [
                'data' => [
                    'name'                  => 'Bali Smart Open Trip Adventure',
                    'tour_description'      => 'Bergabunglah dengan peserta lain yang punya minat dan preferensi wisata serupa! Sistem Smart Open Trip kami akan mencocokkan kamu dengan teman perjalanan terbaik untuk menjelajahi keindahan Bali bersama-sama.',
                    'tour_guide_id'         => $pemandu->id,
                    'tour_location_id'      => $locBali->id,
                    'tour_meeting_point_id' => $mpBali->id,
                    'tour_price'            => 900000,
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
                'availability' => [1, 3, 5], // Senin, Rabu, Jumat
                'categories'   => [$catBeach->id, $catMountain->id],
                'image'        => 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
            ],
        ];

        $result = [];
        foreach ($tourDefs as $key => $def) {
            $name      = $def['data']['name'];
            $existing  = Tour::withTrashed()->where('name', $name)
                ->where('tour_guide_id', $pemandu->id)
                ->first();

            if ($existing) {
                if ($existing->trashed()) {
                    $existing->restore();
                }
                $existing->update($def['data']);
                $tour = $existing;
            } else {
                $tour = Tour::create($def['data']);
            }

            // Upsert gambar pertama
            TourImage::updateOrCreate(
                ['tour_id' => $tour->id, 'image_order' => 1],
                ['image_path' => $def['image'], 'image_caption' => $name]
            );

            // Sync kategori
            $tour->categories()->sync($def['categories']);

            // Upsert ketersediaan hari
            TourAvailability::where('tour_id', $tour->id)->delete();
            foreach ($def['availability'] as $dow) {
                TourAvailability::create(['tour_id' => $tour->id, 'day_of_week' => $dow]);
            }

            $availLabel = empty($def['availability'])
                ? 'Tidak ada jadwal'
                : implode('/', array_map(
                    fn($d) => ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][$d],
                    $def['availability']
                ));

            $this->command->line("  [2] Tour: {$name} (ID #{$tour->id}) | Harga: Rp " .
                number_format($def['data']['tour_price'], 0, ',', '.') .
                " | {$availLabel}");

            $result[$key] = $tour;
        }

        return $result;
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 3 — Booking & Transaksi
    // ────────────────────────────────────────────────────────────────────────

    private function seedBookings(User $ahmad, Guide $pemandu, Tour $tourBali, Tour $tourLombok): void
    {
        $this->command->info('');
        $this->command->info('  [3] Membuat booking & transaksi...');

        // Helper: buat 1 transaksi + booking (idempotent berdasarkan unique marker di catatan)
        $makeBooking = function (
            string $marker,
            Tour $tour,
            string $tourDate,
            string $bookingStatus,
            bool $tourReviewed = false,
            bool $guideReviewed = false,
            string $paymentStatus = 'unpaid',
            ?Carbon $createdAt = null,
            ?Carbon $updatedAt = null,
        ) use ($ahmad, $pemandu): ?array {
            // Cek apakah sudah ada berdasarkan kombinasi user+tour+tanggal yang sama
            $existing = Transaction::where('user_id', $ahmad->id)
                ->where('tour_id', $tour->id)
                ->where('tour_date', $tourDate)
                ->first();

            if ($existing) {
                // Sudah ada, pastikan booking statusnya juga benar
                $booking = $existing->booking;
                if ($booking) {
                    $this->command->line("    Booking [{$marker}] sudah ada (ID #{$booking->id}, status: {$booking->booking_status})");
                    return ['transaction' => $existing, 'booking' => $booking];
                }
            }

            $trx = Transaction::create([
                'user_id'               => $ahmad->id,
                'guide_id'              => $pemandu->id,
                'tour_id'               => $tour->id,
                'participant_count'     => 2,
                'price_per_participant' => $tour->tour_price,
                'tour_date'             => $tourDate,
                'payment_status'        => $paymentStatus,
                'total_amount'          => $tour->tour_price * 2,
            ]);

            $booking = Booking::create([
                'user_id'        => $ahmad->id,
                'transaction_id' => $trx->id,
                'booking_status' => $bookingStatus,
                'tour_reviewed'  => $tourReviewed,
                'guide_reviewed' => $guideReviewed,
            ]);

            // Override timestamps jika diperlukan (untuk TC-045, TC-049)
            if ($createdAt || $updatedAt) {
                DB::table('bookings')->where('id', $booking->id)->update([
                    'created_at' => $createdAt ?? $booking->created_at,
                    'updated_at' => $updatedAt ?? $booking->updated_at,
                ]);
            }

            $this->command->line("    Booking [{$marker}] dibuat (ID #{$booking->id}, status: {$bookingStatus})");

            return ['transaction' => $trx, 'booking' => $booking];
        };

        // ── B1: menunggu_konfirmasi_pemandu ─────────────────────────────────
        // TC-043 (guide terima), TC-044 (guide tolak), TC-046 (wisatawan batal)
        $b1 = $makeBooking('TC-043/044/046', $tourBali, '2026-08-15', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU);

        // ── B2: menunggu_pembayaran ─────────────────────────────────────────
        // TC-047 (bayar via Midtrans), TC-048 (Snap tutup), TC-049 (auto-cancel 24h)
        $makeBooking('TC-047/048', $tourBali, '2026-08-22', Booking::STATUS_MENUNGGU_PEMBAYARAN);

        // ── B3: terkonfirmasi (trip masih akan datang) ──────────────────────
        // TC-062 (tombol Tulis Ulasan TIDAK tampil karena status bukan selesai)
        $makeBooking('TC-062', $tourBali, '2026-09-05', Booking::STATUS_TERKONFIRMASI, false, false, 'paid');

        // ── B4: selesai WITH both reviews ───────────────────────────────────
        // TC-050 (Past Bookings tampil), TC-063 (guide lihat ulasan), TC-064 (guide punya ulasan)
        $b4 = $makeBooking('TC-050/063/064', $tourBali, '2026-05-10', Booking::STATUS_SELESAI, true, true, 'paid');
        if ($b4 && $b4['booking']->tour_reviewed) {
            // Pastikan review records ada
            TourReview::firstOrCreate(
                ['transaction_id' => $b4['transaction']->id],
                [
                    'tour_id' => $tourBali->id,
                    'user_id' => $ahmad->id,
                    'rating'  => 5,
                    'comment' => 'Sunset Bali yang luar biasa! Pemandu sangat profesional dan ramah. Sangat direkomendasikan!',
                ]
            );
            GuideReview::firstOrCreate(
                ['transaction_id' => $b4['transaction']->id],
                [
                    'guide_id' => $pemandu->id,
                    'user_id'  => $ahmad->id,
                    'rating'   => 5,
                    'comment'  => 'Mas Pemandu sangat berpengalaman dan detail menjelaskan setiap tempat. Tur berjalan lancar!',
                ]
            );
        }

        // ── B5: selesai WITHOUT reviews ─────────────────────────────────────
        // TC-059 (submit ulasan rating+teks), TC-060 (rating tanpa teks), TC-061 (validasi wajib)
        $makeBooking('TC-059/060/061', $tourBali, '2026-05-20', Booking::STATUS_SELESAI, false, false, 'paid');

        // ── B6: terkonfirmasi on Lombok Snorkeling ──────────────────────────
        // TC-033 — ada booking aktif → paket tidak bisa dihapus
        $makeBooking('TC-033', $tourLombok, '2026-08-10', Booking::STATUS_TERKONFIRMASI, false, false, 'paid');

        // ── B_TC045: menunggu_konfirmasi_pemandu, dibuat 25 jam lalu ────────
        // TC-045 — simulasi auto-cancel: sudah > 24 jam tanpa konfirmasi pemandu
        $this->seedAutoExpiredBooking(
            'TC-045',
            $ahmad, $pemandu, $tourBali,
            '2026-10-10',
            Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
            Carbon::now()->subHours(25), // created_at 25 jam lalu
            Carbon::now()->subHours(25)  // updated_at 25 jam lalu
        );

        // ── B_TC049: menunggu_pembayaran, diupdate 25 jam lalu ──────────────
        // TC-049 — simulasi auto-cancel: 24 jam tidak dibayar
        $this->seedAutoExpiredBooking(
            'TC-049',
            $ahmad, $pemandu, $tourBali,
            '2026-10-17',
            Booking::STATUS_MENUNGGU_PEMBAYARAN,
            Carbon::now()->subHours(25), // created_at
            Carbon::now()->subHours(25)  // updated_at (yang dicek di BookingsAutoCancel)
        );

        // Update rating rata-rata guide dan tour dari review yang sudah ada
        $avgTour  = TourReview::where('tour_id', $tourBali->id)->avg('rating');
        $avgGuide = GuideReview::where('guide_id', $pemandu->id)->avg('rating');
        if ($avgTour)  $tourBali->update(['tour_rating' => $avgTour]);
        if ($avgGuide) $pemandu->update(['rating' => $avgGuide]);
    }

    /** Buat booking expired untuk test TC-045 / TC-049 (idempotent berdasarkan tour_date unik). */
    private function seedAutoExpiredBooking(
        string $label,
        User $user,
        Guide $guide,
        Tour $tour,
        string $tourDate,
        string $bookingStatus,
        Carbon $createdAt,
        Carbon $updatedAt,
    ): void {
        $existing = Transaction::where('user_id', $user->id)
            ->where('tour_id', $tour->id)
            ->where('tour_date', $tourDate)
            ->first();

        if ($existing && $existing->booking) {
            $this->command->line("    Booking [{$label}] sudah ada (ID #{$existing->booking->id})");
            return;
        }

        $trx = Transaction::create([
            'user_id'               => $user->id,
            'guide_id'              => $guide->id,
            'tour_id'               => $tour->id,
            'participant_count'     => 1,
            'price_per_participant' => $tour->tour_price,
            'tour_date'             => $tourDate,
            'payment_status'        => 'unpaid',
            'total_amount'          => $tour->tour_price,
        ]);

        $booking = Booking::create([
            'user_id'        => $user->id,
            'transaction_id' => $trx->id,
            'booking_status' => $bookingStatus,
            'tour_reviewed'  => false,
            'guide_reviewed' => false,
        ]);

        // Set timestamps lama agar auto-cancel command bisa memprosesnya
        DB::table('bookings')->where('id', $booking->id)->update([
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
        ]);

        $this->command->line("    Booking [{$label}] dibuat (ID #{$booking->id}, created {$createdAt->diffForHumans()})");
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 4 — Smart Open Trip Scenarios
    // ────────────────────────────────────────────────────────────────────────

    private function seedSmartOTScenarios(User $ahmad, Tour $sotTour): void
    {
        $this->command->info('');
        $this->command->info('  [4] Membuat skenario Smart Open Trip...');

        $catBeach    = Category::where('name', 'Beach')->first();
        $catMountain = Category::where('name', 'Mountain')->first();

        $actSurfing    = OpenTripActivity::where('name', 'Surfing')->first();
        $actSnorkeling = OpenTripActivity::where('name', 'Snorkeling')->first();
        $actHiking     = OpenTripActivity::where('name', 'Hiking')->first();
        $actTrekking   = OpenTripActivity::where('name', 'Trekking')->first();

        if (! $actSurfing || ! $catBeach) {
            $this->command->warn('  ⚠ Aktivitas/kategori SOT tidak ditemukan. Jalankan CategorySeeder & OpenTripActivitySeeder dulu.');
            return;
        }

        // ── Skenario TC-052: Ahmad di Waiting Room, bisa keluar ─────────────
        // Date: 2026-09-01
        $this->seedSOTParticipant(
            'TC-052 (Ahmad waiting)',
            $ahmad, $sotTour, '2026-09-01',
            25, 3, 'waiting',
            [$catBeach->id], [$actSurfing->id, $actSnorkeling->id]
        );

        // ── Skenario TC-053/054: Dua user dalam countdown (expires_at masa depan) ─
        // Date: 2026-09-15
        $userCountdown1 = $this->ensureSotUser('sot_countdown1@mail.com', 'Peserta Countdown Satu');
        $userCountdown2 = $this->ensureSotUser('sot_countdown2@mail.com', 'Peserta Countdown Dua');

        $groupCountdown = $this->seedSOTGroupWithParticipants(
            'TC-053/054 (countdown aktif)',
            $sotTour,
            '2026-09-15',
            now()->addHours(4),  // expires_at 4 jam ke depan = countdown masih berjalan
            [
                ['user' => $userCountdown1, 'age' => 24, 'budget' => 3, 'cats' => [$catBeach->id], 'acts' => [$actSurfing->id, $actSnorkeling->id], 'score' => 4.5],
                ['user' => $userCountdown2, 'age' => 26, 'budget' => 3, 'cats' => [$catBeach->id], 'acts' => [$actSurfing->id, $actSnorkeling->id], 'score' => 4.5],
            ]
        );

        // ── Skenario TC-055/056: Countdown habis, window konfirmasi 6 jam ───
        // expires_at 2 jam lalu → countdown habis, tapi 6 jam window belum lewat
        // Date: 2026-09-20
        $userConfirm1 = $this->ensureSotUser('sot_confirm1@mail.com', 'Peserta Konfirmasi Satu');
        $userConfirm2 = $this->ensureSotUser('sot_confirm2@mail.com', 'Peserta Konfirmasi Dua');

        $this->seedSOTGroupWithParticipants(
            'TC-055/056 (window konfirmasi)',
            $sotTour,
            '2026-09-20',
            now()->subHours(2),  // expires_at 2 jam lalu = countdown habis, window masih ada
            [
                ['user' => $userConfirm1, 'age' => 30, 'budget' => 2, 'cats' => [$catMountain->id], 'acts' => [$actHiking->id, $actTrekking->id], 'score' => 4.2],
                ['user' => $userConfirm2, 'age' => 32, 'budget' => 2, 'cats' => [$catMountain->id], 'acts' => [$actHiking->id, $actTrekking->id], 'score' => 4.2],
            ]
        );

        // ── Skenario TC-057: 6 jam habis + ada yang konfirmasi → kirim ke pemandu ─
        // expires_at 8 jam lalu + 6 jam window = 6h window sudah habis
        // sot_sent1 sudah confirm, sot_sent2 tidak → sot_sent1 akan mendapat booking
        // Date: 2026-09-25
        $userSent1 = $this->ensureSotUser('sot_sent1@mail.com', 'Peserta Dikirim Satu');
        $userSent2 = $this->ensureSotUser('sot_sent2@mail.com', 'Peserta Dikirim Dua');

        $this->seedSOTGroupWithParticipants(
            'TC-057 (6h expired, ada konfirmasi)',
            $sotTour,
            '2026-09-25',
            now()->subHours(8),  // expires_at 8 jam lalu = 6h window sudah habis (8 > 6)
            [
                // sot_sent1: sudah konfirmasi (dalam window 6 jam setelah expires_at)
                ['user' => $userSent1, 'age' => 28, 'budget' => 4, 'cats' => [$catBeach->id], 'acts' => [$actSurfing->id], 'score' => 3.8, 'confirmed_at' => now()->subHours(6)],
                // sot_sent2: tidak konfirmasi
                ['user' => $userSent2, 'age' => 30, 'budget' => 4, 'cats' => [$catBeach->id], 'acts' => [$actSurfing->id], 'score' => 3.8, 'confirmed_at' => null],
            ]
        );

        // ── Skenario TC-058: 6 jam habis + TIDAK ADA yang konfirmasi → SOT batal ─
        // Date: 2026-09-28
        $userCancel1 = $this->ensureSotUser('sot_cancel1@mail.com', 'Peserta Batal Satu');
        $userCancel2 = $this->ensureSotUser('sot_cancel2@mail.com', 'Peserta Batal Dua');

        $this->seedSOTGroupWithParticipants(
            'TC-058 (6h expired, tidak ada konfirmasi)',
            $sotTour,
            '2026-09-28',
            now()->subHours(8),  // expires_at 8 jam lalu
            [
                // Tidak ada yang konfirmasi
                ['user' => $userCancel1, 'age' => 45, 'budget' => 2, 'cats' => [$catMountain->id], 'acts' => [$actHiking->id], 'score' => 3.5, 'confirmed_at' => null],
                ['user' => $userCancel2, 'age' => 47, 'budget' => 2, 'cats' => [$catMountain->id], 'acts' => [$actTrekking->id], 'score' => 3.5, 'confirmed_at' => null],
            ]
        );

        $this->command->line('  [4] SOT scenarios: 5 skenario berhasil disiapkan.');
    }

    /** Buat/update satu peserta SOT di status waiting (idempotent). */
    private function seedSOTParticipant(
        string $label,
        User $user,
        Tour $tour,
        string $tripDate,
        int $age,
        int $budget,
        string $status,
        array $catIds,
        array $actIds,
    ): OpenTripParticipant {
        // Cek existing berdasarkan user+tour+date
        $existing = OpenTripParticipant::where('user_id', $user->id)
            ->where('tour_id', $tour->id)
            ->where('trip_date', $tripDate)
            ->first();

        if ($existing) {
            $this->command->line("    SOT [{$label}] sudah ada (participant ID #{$existing->id})");
            return $existing;
        }

        $p = OpenTripParticipant::create([
            'user_id'            => $user->id,
            'tour_id'            => $tour->id,
            'trip_date'          => $tripDate,
            'age'                => $age,
            'budget_level'       => $budget,
            'status'             => $status,
            'registration_count' => 1,
        ]);
        $p->interests()->sync($catIds);
        $p->preferences()->sync($actIds);

        $this->command->line("    SOT [{$label}] dibuat (participant ID #{$p->id}, status: {$status})");
        return $p;
    }

    /** Buat grup SOT dengan peserta-peserta yang sudah matched (idempotent per tour+date). */
    private function seedSOTGroupWithParticipants(
        string $label,
        Tour $tour,
        string $tripDate,
        Carbon $expiresAt,
        array $memberDefs,
    ): OpenTripGroup {
        // Cek grup existing berdasarkan tour+date (hanya grup BBT, bukan dari OpenTripParticipantSeeder)
        $existing = OpenTripGroup::where('tour_id', $tour->id)
            ->where('trip_date', $tripDate)
            ->first();

        if ($existing) {
            $this->command->line("    SOT Group [{$label}] sudah ada (group ID #{$existing->id})");
            return $existing;
        }

        $group = OpenTripGroup::create([
            'tour_id'    => $tour->id,
            'trip_date'  => $tripDate,
            'matched_at' => now()->subHours(12),
            'expires_at' => $expiresAt,
        ]);

        foreach ($memberDefs as $def) {
            $existing = OpenTripParticipant::where('user_id', $def['user']->id)
                ->where('tour_id', $tour->id)
                ->where('trip_date', $tripDate)
                ->first();

            if ($existing) {
                $existing->update([
                    'status'             => 'matched',
                    'group_id'           => $group->id,
                    'matching_score'     => $def['score'],
                    'confirmed_at'       => $def['confirmed_at'] ?? null,
                    'registration_count' => max(1, $existing->registration_count),
                ]);
                continue;
            }

            $catIds = $def['cats'] ?? [];
            $actIds = $def['acts'] ?? [];

            $p = OpenTripParticipant::create([
                'user_id'            => $def['user']->id,
                'tour_id'            => $tour->id,
                'trip_date'          => $tripDate,
                'age'                => $def['age'],
                'budget_level'       => $def['budget'],
                'status'             => 'matched',
                'group_id'           => $group->id,
                'matching_score'     => $def['score'],
                'registration_count' => 1,
                'confirmed_at'       => $def['confirmed_at'] ?? null,
            ]);
            $p->interests()->sync($catIds);
            $p->preferences()->sync($actIds);
        }

        $expLabel = $expiresAt->isPast()
            ? 'expired ' . $expiresAt->diffForHumans()
            : 'expires ' . $expiresAt->diffForHumans();

        $this->command->line("    SOT Group [{$label}] dibuat (group ID #{$group->id}, {$expLabel})");
        return $group;
    }

    /** Pastikan user SOT tersedia (idempotent). */
    private function ensureSotUser(string $email, string $name): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            [
                'name'              => $name,
                'password'          => Hash::make('Sot12345!'),
                'email_verified_at' => now(),
            ]
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // BAGIAN 5 — Keuangan & Pencairan
    // ────────────────────────────────────────────────────────────────────────

    private function seedFinancial(Guide $pemandu, Admin $admin): void
    {
        $this->command->info('');
        $this->command->info('  [5] Membuat data keuangan...');

        // TC-068, TC-071 — Saldo tersedia untuk dilihat di dashboard keuangan
        // (balance sudah diset saat createGuides: available_balance=5_000_000)

        // TC-075 — Pencairan menunggu verifikasi (admin bisa proses)
        $existingPending = Withdrawal::where('guide_id', $pemandu->id)
            ->where('status', Withdrawal::STATUS_MENUNGGU_VERIFIKASI)
            ->where('amount', 3000000)
            ->first();

        if (! $existingPending) {
            Withdrawal::create([
                'guide_id'            => $pemandu->id,
                'amount'              => 3000000,
                'bank_name'           => $pemandu->bank_name ?? 'BCA',
                'bank_account_number' => $pemandu->bank_account_number ?? '1234567890',
                'bank_account_holder' => $pemandu->bank_account_holder ?? 'Pemandu Wisata',
                'status'              => Withdrawal::STATUS_MENUNGGU_VERIFIKASI,
            ]);
            $this->command->line('    Withdrawal TC-075 (Rp 3.000.000, menunggu_verifikasi) dibuat.');
        } else {
            $this->command->line('    Withdrawal TC-075 sudah ada.');
        }

        // TC-076 — Pencairan dengan rekening tidak valid (admin tolak)
        // Menggunakan nominal berbeda agar bisa dibedakan
        $existingInvalid = Withdrawal::where('guide_id', $pemandu->id)
            ->where('status', Withdrawal::STATUS_MENUNGGU_VERIFIKASI)
            ->where('amount', 1500000)
            ->first();

        if (! $existingInvalid) {
            Withdrawal::create([
                'guide_id'            => $pemandu->id,
                'amount'              => 1500000,
                'bank_name'           => 'BNI',
                'bank_account_number' => '0000000000', // nomor tidak valid
                'bank_account_holder' => 'Nama Berbeda Tidak Valid',
                'status'              => Withdrawal::STATUS_MENUNGGU_VERIFIKASI,
            ]);
            $this->command->line('    Withdrawal TC-076 (Rp 1.500.000, rekening invalid) dibuat.');
        } else {
            $this->command->line('    Withdrawal TC-076 sudah ada.');
        }

        $this->command->line("    Saldo available guide: Rp " .
            number_format($pemandu->available_balance, 0, ',', '.'));
    }

    // ────────────────────────────────────────────────────────────────────────
    // RINGKASAN
    // ────────────────────────────────────────────────────────────────────────

    private function printSummary(User $ahmad, Guide $pemandu, Guide $pemanduBaru, Guide $pemanduKyc, Admin $admin): void
    {
        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════════════════╗');
        $this->command->info('║                  RINGKASAN KREDENSIAL BBT                       ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  PERAN              │ EMAIL                    │ PASSWORD         ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  Wisatawan (Tourist)│ ahmad@mail.com           │ Ahmad1234!       ║');
        $this->command->info('║  Guide Aktif        │ pemandu@mail.com         │ Pemandu123!      ║');
        $this->command->info('║  Guide Belum Verif  │ pemandu_baru@mail.com    │ PemanduBaru123!  ║');
        $this->command->info('║  Guide KYC Pending  │ pemandu_kyc@mail.com     │ PemanduKyc123!   ║');
        $this->command->info('║  Administrator      │ admin@travelink.id       │ Admin2024!       ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  USER SOT (pw: Sot12345!)                                        ║');
        $this->command->info('║  TC-053/054: sot_countdown1@mail.com, sot_countdown2@mail.com    ║');
        $this->command->info('║  TC-055/056: sot_confirm1@mail.com, sot_confirm2@mail.com        ║');
        $this->command->info('║  TC-057   : sot_sent1@mail.com (sudah konfirmasi)                ║');
        $this->command->info('║             sot_sent2@mail.com (belum konfirmasi)                ║');
        $this->command->info('║  TC-058   : sot_cancel1@mail.com, sot_cancel2@mail.com           ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  PAKET WISATA (semua oleh pemandu@mail.com)                      ║');
        $this->command->info('║  Bali Sunset Tour      (Sen/Kam/Sab) Rp750rb — TC-028,039,043   ║');
        $this->command->info('║  Wisata Kuliner Jakarta (no avail)   Rp350rb — TC-036,040        ║');
        $this->command->info('║  Lombok Snorkeling     (Rab/Min)     Rp450rb — TC-033 (aktif)   ║');
        $this->command->info('║  Yogyakarta Heritage   (Sab/Min)     Rp800rb — TC-034 (featured)║');
        $this->command->info('║  Bali Smart Open Trip  (Sen/Rab/Jum) Rp900rb — TC-051–058       ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  BOOKING STATUS TERSEDIA (user: ahmad@mail.com)                  ║');
        $this->command->info('║  menunggu_konfirmasi_pemandu          (TC-043,044,046)            ║');
        $this->command->info('║  menunggu_pembayaran                  (TC-047,048)               ║');
        $this->command->info('║  terkonfirmasi — trip belum selesai   (TC-062)                   ║');
        $this->command->info('║  selesai + ulasan SUDAH ditulis       (TC-050,063,064)           ║');
        $this->command->info('║  selesai + ulasan BELUM ditulis       (TC-059,060,061)           ║');
        $this->command->info('║  terkonfirmasi (Lombok, aktif)        (TC-033)                   ║');
        $this->command->info('╠══════════════════════════════════════════════════════════════════╣');
        $this->command->info('║  COMMAND UNTUK SIMULASI WAKTU:                                   ║');
        $this->command->info('║  php artisan bookings:auto-cancel     (TC-045, TC-049)           ║');
        $this->command->info('║  php artisan opentrip:process-results (TC-057, TC-058)           ║');
        $this->command->info('╚══════════════════════════════════════════════════════════════════╝');
        $this->command->info('');
    }
}

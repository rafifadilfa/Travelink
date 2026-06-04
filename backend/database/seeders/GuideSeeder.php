<?php

namespace Database\Seeders;

use App\Models\Guide;
use App\Models\Country;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GuideSeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::where('ISO_code_2', 'ID')->first();

        if (!$country) {
            $this->command->error('Country "ID" tidak ditemukan. Jalankan CountrySeeder dulu.');
            return;
        }

        // Buat file placeholder KYC (1×1 transparent GIF — valid image, minimal size)
        $placeholder = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        Storage::disk('public')->makeDirectory('kyc');
        Storage::disk('public')->put('kyc/seeder_ktp.jpg', $placeholder);
        Storage::disk('public')->put('kyc/seeder_selfie.jpg', $placeholder);
        Storage::disk('public')->put('kyc/seeder_certificate.jpg', $placeholder);

        // Bersihkan guides + pivot sebelum seed ulang
        // (FK checks dikelola DatabaseSeeder secara global)
        DB::table('guide_languages')->truncate();
        DB::table('guide_specialities')->truncate();
        Guide::truncate();

        $phoneCode = $country?->phoneCountryCode?->id;

        // ----------------------------------------------------------------
        // Guide 1: Sarah Johnson — AKTIF (verified), guide utama untuk semua
        //          data pesanan & keuangan
        // ----------------------------------------------------------------
        $profilePicture = null;
        $response = Http::timeout(5)->get('https://randomuser.me/api/portraits/women/44.jpg');
        if ($response->successful()) {
            $fileName = Str::random(20) . '.jpg';
            Storage::disk('public')->put("guide-profile-photos/{$fileName}", $response->body());
            $profilePicture = "guide-profile-photos/{$fileName}";
        }

        Guide::create([
            'name'                  => 'Sarah Johnson',
            'email'                 => 'sarah.johnson@example.com',
            'email_verified_at'     => now(),
            'phone_country_code_id' => $phoneCode,
            'phone_number'          => '082112345678',
            'country_id'            => $country->id,
            'profile_picture'       => $profilePicture,
            'about'                 => 'Pemandu wisata profesional dengan 5+ tahun pengalaman di Bali. Spesialisasi tur budaya dan aktivitas pantai. Saya senang berbagi keindahan dan budaya Indonesia kepada wisatawan dari seluruh dunia.',
            'experience_years'      => 5,
            'password'              => bcrypt('sarah123'),
            'verification_status'   => Guide::STATUS_VERIFIED,
            // Dokumen KYC (disimulasi dengan file placeholder)
            'ktp_document'          => 'kyc/seeder_ktp.jpg',
            'selfie_ktp_document'   => 'kyc/seeder_selfie.jpg',
            'certificate_document'  => 'kyc/seeder_certificate.jpg',
            // Profil profesional
            'base_rate'             => 500000,
            // Rekening bank untuk pencairan (UC-13)
            'bank_name'             => 'BCA',
            'bank_account_number'   => '1234567890',
            'bank_account_holder'   => 'Sarah Johnson',
            // Saldo akan di-set ulang oleh TransactionSeeder + WithdrawalSeeder
            'pending_balance'       => 0,
            'available_balance'     => 0,
        ]);

        // ----------------------------------------------------------------
        // Guide 2: Budi Pekerti — BELUM DIVERIFIKASI (pending, baru daftar)
        // ----------------------------------------------------------------
        Guide::create([
            'name'                  => 'Budi Pekerti',
            'email'                 => 'budi.guide@travelink.com',
            'email_verified_at'     => now(),
            'phone_country_code_id' => $phoneCode,
            'phone_number'          => '081234567890',
            'country_id'            => $country->id,
            'about'                 => null,
            'experience_years'      => 0,
            'password'              => bcrypt('budi123'),
            'verification_status'   => Guide::STATUS_PENDING,
        ]);

        // ----------------------------------------------------------------
        // Guide 3: Rina Wijaya — MENUNGGU VERIFIKASI (sudah upload dokumen)
        // ----------------------------------------------------------------
        Guide::create([
            'name'                  => 'Rina Wijaya',
            'email'                 => 'rina.guide@travelink.com',
            'email_verified_at'     => now(),
            'phone_country_code_id' => $phoneCode,
            'phone_number'          => '082234567891',
            'country_id'            => $country->id,
            'about'                 => 'Pemandu wisata berpengalaman di Yogyakarta dan Solo. Spesialisasi warisan budaya Jawa.',
            'experience_years'      => 3,
            'password'              => bcrypt('rina123'),
            'verification_status'   => Guide::STATUS_MENUNGGU_VERIFIKASI,
            // Dokumen sudah diupload, menunggu admin meninjau
            'ktp_document'          => 'kyc/seeder_ktp.jpg',
            'selfie_ktp_document'   => 'kyc/seeder_selfie.jpg',
            'certificate_document'  => 'kyc/seeder_certificate.jpg',
        ]);

        // ----------------------------------------------------------------
        // Guide 4: Doni Santoso — DITOLAK (dokumen tidak memenuhi syarat)
        // ----------------------------------------------------------------
        Guide::create([
            'name'                  => 'Doni Santoso',
            'email'                 => 'doni.guide@travelink.com',
            'email_verified_at'     => now(),
            'phone_country_code_id' => $phoneCode,
            'phone_number'          => '083345678901',
            'country_id'            => $country->id,
            'about'                 => 'Pemandu wisata di Lombok dan Nusa Tenggara Barat.',
            'experience_years'      => 2,
            'password'              => bcrypt('doni123'),
            'verification_status'   => Guide::STATUS_REJECTED,
            // Dokumen sempat diupload, lalu ditolak
            'ktp_document'          => 'kyc/seeder_ktp.jpg',
            'selfie_ktp_document'   => 'kyc/seeder_selfie.jpg',
            'rejection_reason'      => 'Foto KTP tidak jelas dan buram. Mohon unggah ulang KTP dengan pencahayaan yang lebih baik dan resolusi minimal 800×600 piksel.',
        ]);

        $this->command->info('GuideSeeder: 4 guide berhasil dibuat (verified, pending, menunggu_verifikasi, rejected).');
    }
}

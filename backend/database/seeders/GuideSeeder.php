<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Guide;
use Illuminate\Database\Seeder;

class GuideSeeder extends Seeder
{
    public function run(): void
    {
        $country = Country::where('ISO_code_2', 'ID')->first();

        if (! $country) {
            $this->command->error('Country Indonesia (ISO: ID) tidak ditemukan. Jalankan CountrySeeder dulu.');
            return;
        }

        $phoneCode = $country->phoneCountryCode;

        $guides = [
            [
                'name'                => 'Sarah Johnson',
                'email'               => 'sarah.johnson@example.com',
                'password'            => bcrypt('sarah123'),
                'phone_number'        => '082112345678',
                'about'               => 'Pemandu wisata profesional dengan pengalaman 5+ tahun di Bali. Spesialisasi tour budaya, pantai, dan aktivitas air. Senang berbagi keindahan dan keunikan Indonesia kepada wisatawan dari seluruh dunia.',
                'experience_years'    => 5,
                'verification_status' => 'verified',
                'rating'              => 4.9,
            ],
            [
                'name'                => 'Budi Santoso',
                'email'               => 'budi.santoso@example.com',
                'password'            => bcrypt('budi123'),
                'phone_number'        => '081298765432',
                'about'               => 'Pemandu wisata lokal Lombok dan Yogyakarta. Ahli trekking Rinjani dan tur candi Borobudur. Sudah memandu lebih dari 300 wisatawan mancanegara maupun domestik.',
                'experience_years'    => 7,
                'verification_status' => 'verified',
                'rating'              => 4.8,
            ],
        ];

        foreach ($guides as $data) {
            Guide::updateOrCreate(
                // Kunci unik: cari berdasarkan email
                ['email' => $data['email']],
                // Data yang di-set atau di-update
                array_merge($data, [
                    'email_verified_at'    => now(),
                    'country_id'           => $country->id,
                    'phone_country_code_id'=> $phoneCode?->id,
                    'profile_picture'      => null,
                ])
            );
        }

        $count = Guide::whereIn('email', array_column($guides, 'email'))->count();
        $this->command->info("GuideSeeder selesai: {$count} guide tersedia (semua verified).");
    }
}

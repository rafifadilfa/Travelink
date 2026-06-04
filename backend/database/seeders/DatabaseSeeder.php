<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Bersihkan direktori storage yang dikelola seeder
        foreach (['tour_images', 'guide-profile-photos', 'user-profile-photos', 'kyc', 'payment_proofs'] as $dir) {
            Storage::disk('public')->deleteDirectory($dir);
            Storage::disk('public')->makeDirectory($dir);
        }

        // Disable FK checks agar truncate di semua seeder tidak gagal karena constraint.
        // Di-enable kembali setelah semua seeder selesai.
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        $this->call([
            // -- Data referensi (tidak bergantung satu sama lain) --
            CountrySeeder::class,
            CategorySeeder::class,
            OpenTripActivitySeeder::class,
            DayPhaseSeeder::class,
            LanguageSeeder::class,
            ItemSeeder::class,
            PaymentMethodSeeder::class,
            SpecialitySeeder::class,
            TagSeeder::class,
            PhoneCountryCodeSeeder::class,
            LocationSeeder::class,

            // -- Akun pengguna --
            AdminSeeder::class,          // Admin WAJIB ada sebelum TransactionSeeder (payment_verified_by)
            UserSeeder::class,
            GuideSeeder::class,          // 4 guide (verified/pending/menunggu_verifikasi/rejected)
            GuideSpecialitySeeder::class,
            GuideLanguageSeeder::class,

            // -- Data tour --
            MeetingPointSeeder::class,
            TourSeeder::class,
            DummyTourSeeder::class,
            TourImageSeeder::class,
            TourItinerarySeeder::class,
            TourItemSeeder::class,
            TourCategorySeeder::class,
            TourTagSeeder::class,
            TransactionSeeder::class,
            OpenTripParticipantSeeder::class,
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}

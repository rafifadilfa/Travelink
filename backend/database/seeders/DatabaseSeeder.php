<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Storage::disk('public')->deleteDirectory('tour_images');
        Storage::disk('public')->makeDirectory('tour_images');
        Storage::disk('public')->deleteDirectory('guide-profile-photos');
        Storage::disk('public')->makeDirectory('guide-profile-photos');
        Storage::disk('public')->deleteDirectory('user-profile-photos');
        Storage::disk('public')->makeDirectory('user-profile-photos');

        $this->call([
            CountrySeeder::class,
            CategorySeeder::class,
            DayPhaseSeeder::class,
            LanguageSeeder::class,
            ItemSeeder::class,
            PaymentMethodSeeder::class,
            SpecialitySeeder::class,
            TagSeeder::class,
            PhoneCountryCodeSeeder::class,
            LocationSeeder::class,
            UserSeeder::class,
            GuideSeeder::class,
            GuideSpecialitySeeder::class,
            GuideLanguageSeeder::class,
            MeetingPointSeeder::class,
            TourSeeder::class,
            TourImageSeeder::class,
            TourItinerarySeeder::class,
            TourItemSeeder::class,
            TourCategorySeeder::class,
            TourTagSeeder::class,
            TransactionSeeder::class,
        ]);
    }
}

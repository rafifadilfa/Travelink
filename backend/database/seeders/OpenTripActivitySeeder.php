<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\OpenTripActivity;
use Illuminate\Database\Seeder;

class OpenTripActivitySeeder extends Seeder
{
    /**
     * Seed aktivitas Smart Open Trip per kategori.
     * Format: 'Nama Kategori' => ['Aktivitas 1', 'Aktivitas 2', ...]
     *
     * Nama kategori harus cocok dengan data di CategorySeeder.
     */
    public function run(): void
    {
        $activitiesByCategory = [
            'Beach' => [
                'Surfing',
                'Snorkeling',
                'Berenang',
                'Island Hopping',
                'Kayaking',
            ],
            'Mountain' => [
                'Hiking',
                'Trekking',
                'Camping',
                'Fotografi Alam',
                'Bird Watching',
            ],
            'City' => [
                'City Tour',
                'Street Food Tour',
                'Kunjungan Museum',
                'Belanja Oleh-oleh',
                'Night Tour',
            ],
            'Diving' => [
                'Scuba Diving',
                'Free Diving',
                'Underwater Photography',
                'Coral Reef Exploration',
                'Night Diving',
            ],
            'Cultural' => [
                'Kunjungan Kuil/Pura',
                'Pertunjukan Tari Tradisional',
                'Kelas Memasak Lokal',
                'Kelas Membatik',
                'Upacara Adat',
            ],
            'Nature' => [
                'Jungle Trekking',
                'Wildlife Watching',
                'River Rafting',
                'Kunjungan Air Terjun',
                'Eco Tour',
            ],
        ];

        foreach ($activitiesByCategory as $categoryName => $activities) {
            $category = Category::where('name', $categoryName)->first();

            if (! $category) {
                $this->command->warn("Kategori '{$categoryName}' tidak ditemukan. Jalankan CategorySeeder terlebih dahulu.");
                continue;
            }

            foreach ($activities as $activityName) {
                OpenTripActivity::firstOrCreate(
                    ['name' => $activityName, 'category_id' => $category->id]
                );
            }
        }

        $this->command->info('OpenTripActivitySeeder selesai: ' . OpenTripActivity::count() . ' aktivitas terseed.');
    }
}

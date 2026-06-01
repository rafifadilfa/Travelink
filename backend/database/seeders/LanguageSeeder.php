<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Read the JSON file
        $json = File::get(database_path('data/countries.json'));
        $data = json_decode($json, true);

        Language::truncate(); // Clear existing languages before seeding
        $allLanguages = [];

        // 2. Loop through all countries to collect every language mentioned
        if ($data) {
            foreach ($data as $country) {
                if (!empty($country['languages'])) {
                    foreach ($country['languages'] as $language) {
                        $allLanguages[] = $language;
                    }
                }
            }
        }

        // 3. Filter the list to get only unique language names
        $uniqueLanguages = array_unique($allLanguages);
        sort($uniqueLanguages); // Optional: sort them alphabetically

        // Optional: Clear the table before seeding
        Language::truncate();

        // 4. Loop through the unique list and create records
        foreach ($uniqueLanguages as $languageName) {
            Language::create([
                'name' => $languageName,
            ]);
        }
    }
}

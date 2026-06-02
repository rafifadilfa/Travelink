<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Read the JSON file
        $json = File::get(database_path('data/countries.json'));
        // 2. Decode the JSON data into an array
        $countries = json_decode($json, true);

        Country::truncate(); // Clear existing countries before seeding

        // 3. Loop through the array and create each country
        foreach ($countries as $countryData) {
            Country::create([
                'country_name' => $countryData['name']['common'],
                'ISO_code_2' => $countryData['cca2'] ?? null,
            ]);
        }
    }
}

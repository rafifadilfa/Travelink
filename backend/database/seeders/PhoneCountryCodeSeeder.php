<?php

namespace Database\Seeders;

use App\Models\PhoneCountryCode;
use App\Models\Country;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PhoneCountryCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        {
        // 1. Read the JSON file
        $json = File::get(database_path('data/countries.json'));
        $data = json_decode($json, true);

        PhoneCountryCode::truncate(); // Clear existing phone country codes before seeding

        // 2. Loop through all countries to collect every language mentioned
        if ($data) {
            
            foreach ($data as $country) {
                $countryid = Country::where('ISO_code_2', $country['cca2'])->first();
                
                if ($countryid && !empty($country['idd']['root'])) {
                    $CallingCode = $country['idd']['root'] . ($country['idd']['suffixes'][0] ?? '');

                    // This single line replaces the if/exists/create block.
                    PhoneCountryCode::firstOrCreate(
                        ['phone_country_code' => $CallingCode], // Attributes to find
                        ['country_id' => $countryid->id]         // Additional attributes to use ONLY on creation
                    );
                }
            }
        }
    }
    }
}

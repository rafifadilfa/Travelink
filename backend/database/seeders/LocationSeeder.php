<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $country = Country::where('ISO_code_2', 'ID')->first();

        $locations = [
            'Bali',
            'Lombok',
            'Jakarta',
            'Yogyakarta',
            'Papua',
            'Flores',
            'Sumatra',
        ];

        Location::truncate(); // Clear existing locations before seeding

        foreach ($locations as $locationName) {
            Location::create([
                'name' => $locationName,
                'country_id' => $country?->id,
            ]);
        }
    }
}

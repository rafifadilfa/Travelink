<?php

namespace Database\Seeders;

use App\Models\Guide;
use App\Models\Country;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class GuideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $country = Country::where('ISO_code_2', 'ID')->first();
        $response = Http::get('https://randomuser.me/api/portraits/women/44.jpg');

        if (!$country) {
            $this->command->error('Country with ISO code "ID" not found. Please run the CountrySeeder first.');
            return; // Stop the seeder
        }

        Guide::truncate(); // Clear existing guides before seeding

        if ($response->successful()){
            $extension = 'jpg'; // Unsplash returns jpgs by default
            $fileName = Str::random(20) . '.' . $extension;

            // Save to public disk (storage/app/public/tour_images)
            Storage::disk('public')->put("guide-profile-photos/{$fileName}", $response->body());

            Guide::Create([
                'name' => 'Sarah Johnson',
                'email' => 'sarah.johnson@example.com',
                'email_verified_at' => now(),
                'phone_country_code_id' => $country?->phoneCountryCode?->id,
                'phone_number' => '082112345678',
                'country_id' => $country?->id,
                'rating' => 0,
                'review' => 0,
                'profile_picture' => "guide-profile-photos/{$fileName}",
                'about' => 'Professional travel guide with 5+ years of experience in Bali. Specialized in cultural tours and beach activities. I love sharing the beauty and culture of Indonesia with travelers from around the world. Lets create unforgettable memories together!',
                'experience_years' => 0,
                'password' => bcrypt('sarah123'),
            ]);            
        }
    }
}

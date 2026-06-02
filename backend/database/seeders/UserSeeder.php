<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Country;
use App\models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::truncate(); // Clear existing users before seeding

        $country = Country::where('ISO_code_2', 'ID')->first();
        $language = Language::where('name', 'Indonesian')->first();
        $response = Http::get('https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMHBob3RvJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&q=60');

        if ($response->successful()) {
            // Generate a unique file name with the original extension
            $extension = 'jpg'; // Unsplash returns jpgs by default
            $fileName = Str::random(20) . '.' . $extension;

            // Save to public disk (storage/app/public/tour_images)
            Storage::disk('public')->put("user-profile-photos/{$fileName}", $response->body());

            // Store DB record (relative path)
            User::Create([
                'name' => 'Sarah Anderson',
                'email' => 'sarah.anderson@example.com',
                'email_verified_at' => now(),
                'phone_country_code_id' => $country?->phoneCountryCode?->id,
                'phone_number' => '082112345678',
                'language_id' => $language->id,
                'booking_count' => 0,
                'review_count_guide' => 0,
                'review_count_tour' => 0,
                'profile_photo_path' => "user-profile-photos/{$fileName}",
                'password' => bcrypt('sarah123'),
            ]);
        }
    }
}

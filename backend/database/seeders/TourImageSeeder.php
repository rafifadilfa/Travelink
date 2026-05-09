<?php

namespace Database\Seeders;

use App\Models\TourImage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class TourImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $images = [
            'https://images.unsplash.com/photo-1573790387438-4da905039392',
            'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
            'https://images.unsplash.com/photo-1512100356356-de1b84283e18',
            'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992',
        ];

        $order = 1;

        TourImage::truncate(); // Clear existing tour images before seeding

        foreach ($images as $url) {
            // Download image from the internet
            $response = Http::get($url);

            if ($response->successful()) {
                // Generate a unique file name with the original extension
                $extension = 'jpg'; // Unsplash returns jpgs by default
                $fileName = Str::random(20) . '.' . $extension;

                // Save to public disk (storage/app/public/tour_images)
                Storage::disk('public')->put("tour_images/{$fileName}", $response->body());

                // Store DB record (relative path)
                TourImage::create([
                    'tour_id' => 1, // change to your tour ID logic
                    'image_path' => "tour_images/{$fileName}",
                    'image_caption' => 'Bali_' . $order,
                    'image_order' => $order,
                ]);

                $order++;
            }
        }
    }
}

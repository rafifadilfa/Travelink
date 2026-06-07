<?php

namespace Database\Seeders;

use App\Models\TourItinerary;
use App\Models\Tour;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourItinerarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $activities = [
            'Hotel pickup',
            'Balangan Beach',
            'Padang Padang Beach',
            'Lunch at Uluwatu',
            'Dreamland Beach',
            'Return to Hotel',
        ];

        $startTimes = [
            '08:30',
            '09:30',
            '11:00',
            '12:30',
            '14:00',
            '16:30',
        ];

        $descriptions = [
            'Our guide will pick you up from your hotel in a modern, air-conditioned vehicle.',
            'Visit this hidden gem known for its pristine white sand and crystal clear turquoise waters.',
            'Explore the famous beach from "Eat Pray Love" with its unique and dramatic rock formations.',
            'Enjoy a delicious Indonesian lunch at a stunning cliff-top restaurant with panoramic ocean views.',
            'Relax and unwind at this beautiful beach, with ample opportunities for swimming and sunbathing.',
            'Drop off at your hotel, filled with memories of a wonderful day of beach exploration.'
        ];

        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();

        TourItinerary::truncate(); // Clear existing itineraries before seeding

        // Check if the tour exists
        if ($tour) {
            // Use a for loop that counts from 0 up to the number of items in your array
            for ($i = 0; $i < count($activities); $i++) {
                TourItinerary::create([
                    'tour_id'     => $tour->id,
                    'step_number' => $i + 1, // Use the loop index for the step number
                    'start_time'  => $startTimes[$i],  // Get the start time at the current index
                    'activity'    => $activities[$i],  // Get the activity at the current index
                    'description' => $descriptions[$i], // Get the description at the current index
                ]);
            }
        }
    }
}

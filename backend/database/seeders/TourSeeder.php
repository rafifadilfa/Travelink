<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\Location;
use App\Models\DayPhase;
use App\Models\Guide;
use App\Models\MeetingPoint;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $location = Location::where('name', 'Bali')->first();
        $dayphase = DayPhase::where('name', 'Morning')->first();
        $guide = Guide::where('name', 'Sarah Johnson')->first();
        $meetingPoint = MeetingPoint::where('name', 'Hotel Lobby Central')->first();

        Tour::truncate(); // Clear existing tours before seeding

        if($location && $dayphase && $guide) {
            Tour::create([
                'name' => 'Bali Beach Hopping Adventure',
                'tour_location_id' => $location->id,
                'tour_meeting_point_id' => $meetingPoint->id,
                'tour_description' => 'Experience the magic of Bali with this exclusive beach hopping tour, visiting the most stunning coastal spots on the island. Our professional guides will take you to hidden gems along the coastline, showcasing the incredible beauty of Bali\'s beaches. You\'ll have opportunities for swimming, sunbathing, and capturing amazing photos throughout the day.',
                'tour_guide_id' => $guide->id,
                'tour_price' => 1200000, // Price in IDR
                'tour_duration' => 8, // Duration in hours
                'tour_start_time' => '08:30:00',
                'tour_period_id' => $dayphase->id,
                'tour_rating' => 0.00,
                'tour_review_count' => 0,
                'tour_booking_count' => 0,
                'tour_max_participants' => 10,
                'tour_min_participants' => 1,
                'tour_status' => 'published',
                'featured' => false,
            ]);

            $guide->increment('total_tours');
        }
    }
}

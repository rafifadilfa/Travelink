<?php

namespace Database\Seeders;

use App\Models\MeetingPoint;
use App\Models\Location;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MeetingPointSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $meetingPoints = [
            [
                'name' => 'Hotel Lobby Central',
                'location' => Location::where('name', 'Bali')->first(),
            ],
            [
                'name' => 'Lombok Main Harbor, Pier B',
                'location' => Location::where('name', 'Lombok')->first(),
            ],
            [
                'name' => 'Monas statue entrance',
                'location' => Location::where('name', 'Jakarta')->first(),
            ],
        ];

        MeetingPoint::truncate(); // Clear existing meeting points before seeding

        foreach ($meetingPoints as $meetingPointData) {
            MeetingPoint::create([
                'name' => $meetingPointData['name'],
                'location_id' => $meetingPointData['location']->id,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\DayPhase;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DayPhaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define the day phases
        $dayPhases = [
            'Morning',
            'Afternoon',
            'Evening',
            'Night',
        ];

        $Description = [
            'Periode Waktu di antara 5 AM sampai 12 PM.',
            'Periode Waktu di antara 12 PM sampai 5 PM.',
            'Periode Waktu di antara 5 PM sampai 9 PM.',
            'Periode Waktu di antara 9 PM sampai 4 AM.',
        ];

        DayPhase::truncate(); // Clear existing day phases before seeding

        // Loop through each day phase and create it in the database
        for($i = 0; $i < count($dayPhases); $i++) {
            DayPhase::create([
                'name' => $dayPhases[$i],
                'description' => $Description[$i],
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use app\Models\Guide;
use App\Models\Speciality;
use App\Models\GuideSpeciality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GuideSpecialitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Find the guide you want to assign specialities to
        $guide = Guide::where('name', 'Sarah Johnson')->first();

        if (!$guide) {
            $this->command->error('Guide "Sarah Johnson" not found!');
            return;
        }

        // 2. Define the array of speciality names for this guide
        $guideSpecialityNames = [
            'Cultural Tours',
            'Beach Activities',
            'Adventure Sports',
            'Culinary Experiences',
            'Yoga Retreats',
        ];

        // 3. Use whereIn() to find all matching specialities from the database
        //    and use pluck() to get an array of just their IDs.
        //    This is extremely efficient.
        $specialityIds = Speciality::whereIn('name', $guideSpecialityNames)->pluck('id');

        // 4. Use sync() to make the guide's specialities exactly match the list of IDs.
        //    This will detach any old specialities and attach the new ones.
        $guide->specialities()->sync($specialityIds);

        $this->command->info('Specialities have been synced for guide "Sarah Johnson".');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Speciality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecialitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialities = [
            'Adventure',
            'Cultural',
            'Historical',
            'Nature',
            'Relaxation',
            'Wildlife',
            'Water Sports',
            'Food & Drink',
            'Wellness & Spa',
            'Photography',
            'Cultural Tours', 
            'Beach Activities', 
            'Adventure Sports', 
            'Culinary Experiences', 
            'Yoga Retreats',
        ];

        Speciality::truncate(); // Clear existing specialities before seeding

        foreach ($specialities as $speciality) {
            Speciality::create([
                'name' => $speciality,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            'Beach Exploration', 
            'Swimming', 
            'Cultural Experience', 
            'Local Cuisine', 
            'Photography', 
            'Hidden Gems',
        ];

        Tag::truncate(); // Clear existing tags before seeding

        foreach($tags as $tag) {
            Tag::create([
                'name' => $tag,
            ]);
        }
    }
}

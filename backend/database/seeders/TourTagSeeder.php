<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();
        $alltags = Tag::get();

        if (!$tour || $alltags->isEmpty()) {
            $this->command->error('Could not find tour or tags to create tour tags.');
            return; // Stop the seeder
        }

        $tourtags = [
            'Beach Exploration', 
            'Swimming', 
            'Cultural Experience', 
            'Local Cuisine', 
            'Photography', 
            'Hidden Gems',
        ];

        // Clear existing tour tags before seeding
        $tour->tags()->detach();

        $pivotData = [];

        foreach ($alltags as $tag) {
            $isIncluded = in_array($tag->name, $tourtags);
            
            // Build an array with the tag ID and the extra pivot data
            $pivotData[$tag->id] = ['is_included' => $isIncluded];
        }

        // Attach all tags and their pivot data in a single, efficient operation
        $tour->tags()->attach($pivotData);
    }
}

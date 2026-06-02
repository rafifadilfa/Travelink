<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();
        $category = Category::where('name', 'Beach')->first();

        if (!$tour || !$category) {
            $this->command->error('Could not find tour or category to create tour category.');
            return; // Stop the seeder
        }

        // Clear existing tour categories before seeding
        $tour->categories()->detach();

        // Attach the tour to the category
        $tour->categories()->attach($category->id);
    }
}

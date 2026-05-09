<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Beach',
            'City',
            'Diving',
            'Mountain',
            'Cultural',
            'Nature',
        ];

        Category::truncate(); // Clear existing categories before seeding

        foreach ($categories as $category) {
            Category::create([
                'name' => $category,
            ]);
        }
    }
}

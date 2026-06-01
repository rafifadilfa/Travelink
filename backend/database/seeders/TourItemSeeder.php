<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Tour;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TourItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();
        $allItems = Item::get();

        if (!$tour || $allItems->isEmpty()) {
            $this->command->error('Could not find tour or items to create tour items.');
            return; // Stop the seeder
        }

        $includedItemNames = [
            'Hotel pickup and drop-off', 
            'Air-conditioned vehicle', 
            'Professional local guide', 
            'Lunch at local restaurant', 
            'Bottled water', 
            'Snorkeling equipment',
        ];

        // Clear existing tour items before seeding
        $tour->items()->detach();

        // Prepare the data to be attached
        $pivotData = [];
        foreach ($allItems as $item) {
            $isIncluded = in_array($item->name, $includedItemNames);
            
            // Build an array with the item ID and the extra pivot data
            $pivotData[$item->id] = ['is_included' => $isIncluded];
        }

        // Attach all items and their pivot data in a single, efficient operation
        $tour->items()->attach($pivotData);
    }
}

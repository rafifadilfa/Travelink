<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $Items = [
            'Hotel pickup and drop-off', 
            'Air-conditioned vehicle', 
            'Professional local guide', 
            'Lunch at local restaurant', 
            'Bottled water', 
            'Snorkeling equipment',
            'Alcoholic beverages', 
            'Personal expenses', 
            'Additional activities', 
            'Gratuities'
        ];

        Item::truncate(); // Clear existing items before seeding

        foreach($Items as $item) {
            Item::create([
                'name' => $item,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Guide;
use App\Models\Language;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GuideLanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $Languages = [
            'English',
            'Japanese',
            'Indonesian',
        ];

        $guide = Guide::where('name', 'Sarah Johnson')->first();

        if (!$guide) {
            $this->command->error('Could not find guide to create guide languages.');
            return; // Stop the seeder
        }

        $pivotData = [];

        // Find all the corresponding language models at once and get their IDs.
        // This is much more efficient than querying one by one in a loop.
        $languageIds = Language::whereIn('name', $Languages)->pluck('id');

        // Use sync() to make the guide's languages exactly match the list of IDs.
        // It will automatically attach new ones and detach old ones.
        $guide->languages()->sync($languageIds);
    }
}

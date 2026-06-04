<?php

namespace Database\Seeders;

use App\Models\Tour;
use App\Models\TourAvailability;
use Illuminate\Database\Seeder;

class TourAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        TourAvailability::truncate();

        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();

        if (!$tour) {
            $this->command->error('Tour "Bali Beach Hopping Adventure" tidak ditemukan.');
            return;
        }

        // Tersedia Senin, Rabu, Jumat, Sabtu
        // (0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu)
        $days = [1, 3, 5, 6];

        foreach ($days as $day) {
            TourAvailability::create([
                'tour_id'     => $tour->id,
                'day_of_week' => $day,
            ]);
        }

        $this->command->info('TourAvailabilitySeeder: jadwal Senin/Rabu/Jumat/Sabtu ditambahkan.');
    }
}

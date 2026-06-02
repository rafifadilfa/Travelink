<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Pakai firstOrCreate agar aman dijalankan berulang kali
        Admin::firstOrCreate(
            ['email' => 'admin@travelink.com'],
            [
                'name'     => 'Admin Travelink',
                'password' => bcrypt('admin123'),
            ]
        );
    }
}

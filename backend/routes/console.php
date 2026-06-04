<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal command otomatis Travelink.
// Jalankan scheduler di production: php artisan schedule:run (via cron tiap menit)
// atau php artisan schedule:work untuk development.

// ASUMSI A3: batalkan pesanan menunggu_konfirmasi_pemandu > 24 jam
Schedule::command('bookings:auto-cancel')->hourly()->description('Auto-cancel pesanan timeout 24 jam');

// ASUMSI A1: selesaikan pesanan terkonfirmasi yang tour_date sudah lewat
Schedule::command('bookings:settle')->hourly()->description('Settle pesanan terkonfirmasi ke selesai');

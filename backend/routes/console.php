<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Tiap hari jam 01:00: cairkan escrow Smart Open Trip yang trip-nya sudah lewat
Schedule::command('opentrip:settle')->dailyAt('01:00');

// Tiap hari jam 02:00: cairkan escrow booking private yang sudah lewat tanggalnya
Schedule::command('bookings:settle')->dailyAt('02:00');

// Tiap 30 menit: proses hasil SOT setelah window konfirmasi 6 jam habis (TC-057/058)
Schedule::command('opentrip:process-results')->everyThirtyMinutes();

// Tiap jam: auto-cancel booking menunggu_konfirmasi_pemandu > 24 jam (TC-045)
Schedule::command('bookings:auto-cancel')->hourly();

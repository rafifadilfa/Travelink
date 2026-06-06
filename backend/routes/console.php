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

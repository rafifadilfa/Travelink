<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Smart Open Trip — Konfigurasi Matching & Countdown
    |--------------------------------------------------------------------------
    |
    | Semua konstanta Smart Open Trip dikumpulkan di sini agar mudah diubah.
    | Jangan hardcode nilai-nilai ini di controller/service.
    |
    */

    // Durasi countdown Tahap 2 (dalam menit).
    // Ubah via .env: OPEN_TRIP_COUNTDOWN_MINUTES=X
    'countdown_minutes' => (int) env('OPEN_TRIP_COUNTDOWN_MINUTES', 2),

    // Jumlah anggota maksimal per grup.
    // Grup tidak akan menerima anggota baru jika sudah mencapai batas ini.
    'max_group_size' => (int) env('OPEN_TRIP_MAX_GROUP_SIZE', 6),
];

<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Booking & Smart Open Trip — Konfigurasi Timeout Auto-Cancel
    |--------------------------------------------------------------------------
    |
    | Semua durasi timeout dikontrol dari sini agar mudah diubah tanpa
    | menyentuh logika. Ubah via .env untuk keperluan testing.
    |
    | Default = perilaku produksi asli:
    |   - Konfirmasi pemandu  : 24 jam  (TC-045)
    |   - Pembayaran          : 24 jam  (TC-049)
    |   - Konfirmasi SOT      :  6 jam  (TC-057 / TC-058)
    |
    */

    // TC-045: berapa menit booking boleh dalam status menunggu_konfirmasi_pemandu
    // sebelum otomatis dibatalkan.
    'guide_confirm_timeout_minutes' => (int) env('GUIDE_CONFIRM_TIMEOUT_MINUTES', 1440),

    // TC-049: berapa menit booking boleh dalam status menunggu_pembayaran
    // sebelum otomatis dibatalkan.
    'payment_timeout_minutes' => (int) env('PAYMENT_TIMEOUT_MINUTES', 1440),

    // TC-056/057/058: berapa menit window konfirmasi Smart Open Trip setelah
    // countdown grup habis. Peserta yang tidak konfirmasi dalam window ini
    // dikeluarkan; jika 0 peserta konfirmasi, grup dibatalkan (TC-058).
    'ot_confirm_timeout_minutes' => (int) env('OT_CONFIRM_TIMEOUT_MINUTES', 360),
];

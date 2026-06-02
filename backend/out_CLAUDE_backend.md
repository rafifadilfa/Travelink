# CLAUDE.md — Backend (Laravel API)

Sub-briefing untuk folder `backend/`. Baca CLAUDE.md root dulu untuk konteks keseluruhan.

## Peran Folder Ini

Laravel sebagai REST API murni. TIDAK melayani UI/Blade — semua tampilan ada di `frontend/` (React). Output controller selalu JSON, bukan view.

## Tech Stack

- Laravel [isi versi, cek composer.json — misal 11.x]
- PHP [isi versi]
- Database: MySQL via XAMPP
- Auth: rencana Laravel Sanctum (BELUM FINAL) — token-based untuk SPA

## Konvensi

- Semua route API di `routes/api.php`, bukan web.php. Prefix otomatis /api
- Controller kembalikan JSON: `return response()->json([...])` atau API Resource
- Gunakan API Resources (`php artisan make:resource`) untuk format response yang konsisten
- Validasi input pakai Form Request (`php artisan make:request`)
- Model singular PascalCase, tabel plural snake_case
- Selalu pakai migration untuk perubahan DB — jangan edit database manual
- Eloquent relationships untuk relasi antar tabel
- Setiap endpoint baru: definisikan request shape & response shape dengan jelas (frontend bergantung pada ini)

## Struktur (UPDATE SESUAI PUNYA LO)

- Models: [misal User, Guide, TourPackage, Booking, Review, OpenTrip, ...]
- Controllers: [isi yang sudah ada]
- Migrations: cek database/migrations

## CORS

Karena frontend beda origin (port 5173) dari backend (port 8000), pastikan CORS dikonfigurasi di config/cors.php agar frontend bisa akses API. Cek ini kalau ada error CORS.

## Perintah Penting

- Jalankan API: `php artisan serve` (default port 8000)
- Migration: `php artisan migrate`
- Model + migration + controller + resource: `php artisan make:model Nama -mcr`
- Bikin API Resource: `php artisan make:resource NamaResource`
- Bikin Form Request: `php artisan make:request NamaRequest`
- Clear cache: `php artisan optimize:clear`
- Lihat semua route: `php artisan route:list`

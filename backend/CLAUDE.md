# CLAUDE.md — Backend (Laravel API)

Sub-briefing untuk folder `backend/`. Baca CLAUDE.md root dulu untuk konteks keseluruhan.

## Peran Folder Ini

Laravel 12 sebagai REST API murni. Target: semua output controller adalah JSON via `routes/api.php`.

**Catatan penting:** `routes/web.php` masih ada dan berisi route Inertia.js dari arsitektur lama — ini **BUKAN target pengembangan**. Abaikan web.php. Semua fitur baru harus masuk ke `routes/api.php`.

## Tech Stack

- **Laravel**: 12.x (cek `composer.json`)
- **PHP**: 8.3.11
- **Database**: MySQL via XAMPP
- **Auth**: Laravel Sanctum — token-based untuk SPA (`personal_access_tokens` sudah ada di DB)
- **Package tambahan**: Inertia.js (legacy, tidak dipakai lagi), Ziggy, Pest (testing)

## Struktur yang Sudah Ada

**Models** (semua di `app/Models/`):
- `User` — wisatawan, auth guard `web`
- `Guide` — pemandu wisata, auth guard `guides`
- `Tour` — paket wisata, pakai SoftDeletes
- `TourImage`, `TourTag`, `TourCategory`, `TourItem`, `TourItinerary` — relasi M2M tour
- `TourReview` — review tour oleh wisatawan (setelah trip selesai)
- `GuideReview` — review pemandu oleh wisatawan
- `Booking` — status booking per transaksi
- `Transaction` — transaksi pembayaran, auto-generate kode `INV-YYYYMMDD-XXXX`
- `PaymentMethod` — metode pembayaran (seed data)
- `Location`, `MeetingPoint` — lokasi & titik kumpul (seed data)
- `Category`, `Tag`, `Item`, `DayPhase` — data referensi tour (seed data)
- `Language`, `GuideLanguage`, `Speciality`, `GuideSpeciality` — profil pemandu
- `Country`, `PhoneCountryCode` — data referensi

**Controllers yang sudah ada** (mayoritas masih pakai Inertia, perlu dikonversi ke JSON API):
- `Api\Auth\AuthApiController` — login, register, forgot-password, logout, get-user (**SUDAH JSON API** ✓)
- `DashboardController` — dashboard wisatawan
- `ViewAllTourController` — list semua tour
- `TourDetailController` — detail 1 tour
- `BookingController` — list booking user + guide, update status booking guide
- `TransactionController` — buat transaksi & update payment
- `PaymentController` — halaman payment
- `CancelBookingController` — cancel booking (user & guide)
- `GuideDashboardController` — dashboard pemandu (minimal, hanya render view)
- `GuideTourController` — list tour guide, detail, soft delete, restore
- `CreateNewTourController` — buat tour baru (validasi lengkap, upload gambar, itinerary)
- `EditTourController` — update tour (validasi lengkap, manajemen gambar)
- `GuideProfileController` — view & update profil pemandu (foto, bahasa, spesialisasi)
- `UserProfileController` — view & update profil wisatawan
- `TourReviewController` — submit review tour
- `GuideReviewController` — submit review pemandu
- `GuideSettingController` — pengaturan akun pemandu
- `Settings\ProfileController`, `Settings\PasswordController` — pengaturan user

**Migrations** (semua sudah ada di `database/migrations/`):
25+ tabel mencakup semua model di atas, termasuk `personal_access_tokens` untuk Sanctum.

## Endpoint API yang Sudah Ada (`routes/api.php`)

```
POST   /api/auth/login           (guest)
POST   /api/auth/register        (guest)
POST   /api/auth/forgot-password (guest)
POST   /api/auth/logout          (auth:sanctum)
GET    /api/auth/user            (auth:sanctum)
```

**Semua endpoint lain BELUM ada di api.php** — logika bisnis sudah ada di controller (masih Inertia), tinggal dikonversi ke JSON response dan didaftarkan di api.php.

## Konvensi

- Semua route API di `routes/api.php`, prefix otomatis `/api`
- Controller kembalikan JSON: `return response()->json([...])` atau API Resource
- Gunakan API Resources (`php artisan make:resource`) untuk format response yang konsisten
- Validasi input pakai Form Request (`php artisan make:request`) untuk request kompleks
- Model singular PascalCase, tabel plural snake_case
- Selalu pakai migration untuk perubahan DB — jangan edit database manual
- Guard: `auth:web` untuk Tourist, `auth:guides` untuk Guide, `auth:sanctum` untuk API

## CORS

Frontend (port 5173) beda origin dari backend (port 8000). Konfigurasi CORS ada di `config/cors.php`. Kalau ada error CORS saat development, cek file ini.

## Perintah Penting

```bash
php artisan serve                         # Jalankan API (port 8000)
php artisan migrate                       # Jalankan migration
php artisan migrate:fresh --seed          # Reset DB + seed ulang
php artisan make:model Nama -mcr          # Model + migration + controller + resource
php artisan make:resource NamaResource    # API Resource
php artisan make:request NamaRequest      # Form Request
php artisan optimize:clear                # Clear semua cache
php artisan route:list --path=api         # Lihat semua route API
php artisan sanctum:purge-expired         # Hapus token kadaluarsa
```

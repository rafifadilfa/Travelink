# CLAUDE.md — Travelink (Root)

Briefing utama untuk Claude Code. Baca file ini dulu sebelum mengerjakan task apapun.
Ada juga CLAUDE.md spesifik di `backend/` dan `frontend/` — baca yang relevan dengan task.

## Tentang Project

Travelink adalah sistem marketplace pemandu wisata berbasis web dengan fitur Smart Open Trip untuk pembentukan grup wisata otomatis. Ini project skripsi (Teknik Informatika, Universitas Bina Nusantara). Deadline: 18 Juni 2026.

Konsep inti: menghubungkan wisatawan dengan pemandu wisata lokal terverifikasi. Fitur unggulan adalah Smart Open Trip yang membentuk grup wisata otomatis menggunakan algoritma Profile Matching berdasarkan kecocokan preferensi (destinasi, tanggal, budget, minat).

## Arsitektur (PENTING)

Project ini DECOUPLED / HEADLESS:

- `backend/`  → Laravel 12, KHUSUS sebagai REST API (output controller = JSON, bukan Blade/Inertia)
- `frontend/` → React 19 + Vite + TypeScript, consume API backend via Axios

Frontend dan backend jalan terpisah:
- Backend API: http://localhost:8000 (php artisan serve)
- Frontend dev: http://localhost:5173 (npm run dev)

**Catatan arsitektur:** Backend saat ini masih punya `routes/web.php` dengan route Inertia.js (legacy dari versi sebelumnya). Route-route tersebut bukan target pengembangan. Semua fitur baru harus dibuat di `routes/api.php` sebagai endpoint JSON, lalu di-consume oleh frontend React.

Saat menambah fitur, selalu kerja di KEDUA sisi: bikin/ubah endpoint di `routes/api.php`, lalu panggil & render di frontend. Pastikan kontrak API (request/response shape) konsisten.

## Role Pengguna

1. **Wisatawan (Tourist)** — cari & booking tour, beri review
2. **Pemandu Wisata (Guide)** — kelola paket tour, terima & konfirmasi booking
3. **Administrator** — verifikasi pemandu (KYC), kelola user & sistem

## Fitur Utama

- Autentikasi & registrasi (Tourist + Guide) — Laravel Sanctum, token-based
- Verifikasi KYC pemandu oleh admin
- Pencarian & filter tour/pemandu (lokasi, rating, kategori, harga)
- Manajemen paket tour (CRUD oleh pemandu)
- Booking Private Trip (search → booking → konfirmasi pemandu → payment)
- Smart Open Trip (booking → waiting room → kuota terpenuhi → split bill otomatis)
- Algoritma Profile Matching (hitung skor kecocokan untuk grup open trip)
- Sistem pembayaran (simulasi, tanpa gateway asli)
- Review & rating tour + pemandu (setelah trip selesai)
- Dashboard admin

## Status Fitur (per Juni 2026)

Website ~35% selesai (koneksi frontend ↔ backend API baru sebagian).

**SUDAH jalan (backend logic ada, tapi sebagian belum terhubung ke frontend):**
- Auth Tourist: register, login, logout, forgot-password — endpoint API `/api/auth/*` sudah ada, frontend Auth.tsx sudah terhubung ✓
- Backend logic (controller + model) untuk: dashboard, view all tours, tour detail, bookings, payment, cancel booking, guide profile, user profile, guide tours (CRUD + soft delete), guide bookings, guide settings, tour review — **SUDAH ada di web.php (Inertia), BELUM di-expose ke api.php**
- Semua migrasi database sudah ada (25+ tabel)
- Model Eloquent sudah lengkap dengan relasi

**BELUM jalan (frontend masih pakai mock data hardcode):**
- Semua halaman frontend kecuali `/` (Auth) masih pakai data statis — belum memanggil API
- Auth Guide (`/guide/auth`) — frontend pakai mock toast, belum ada endpoint API untuk guide
- Hampir semua endpoint REST di `api.php` belum dibuat (hanya `/api/auth/*` untuk Tourist)

**BELUM diimplementasi sama sekali:**
- Smart Open Trip (tidak ada model, controller, route, maupun frontend)
- Algoritma Profile Matching (tidak ada implementasi di mana pun)
- Admin panel (tidak ada route, controller, halaman frontend)
- KYC pemandu (tidak ada flow upload dokumen & review)
- Sistem notifikasi

## Aturan Umum

- Bahasa UI: Indonesia
- Komentar kode: konsisten, pilih Inggris atau Indonesia per file
- Untuk fitur baru, baca dulu kode existing yang relevan agar polanya konsisten
- Jelaskan rencana dulu untuk perubahan besar (multi-file / lintas backend-frontend)
- Jangan hapus/ubah fitur yang sudah jalan tanpa konfirmasi
- Algoritma Profile Matching = bagian paling penting untuk skripsi — kerjakan hati-hati & jelaskan logikanya
- JANGAN pernah baca atau commit file `.env` (ada kredensial database)

## Catatan

- Ada file `AXIOS_SETUP_GUIDE.md` di root — panduan koneksi frontend ke backend
- Gunakan `.git` yang sudah ada untuk version control

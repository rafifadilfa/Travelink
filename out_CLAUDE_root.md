# CLAUDE.md — Travelink (Root)

Briefing utama untuk Claude Code. Baca file ini dulu sebelum mengerjakan task apapun.
Ada juga CLAUDE.md spesifik di `backend/` dan `frontend/` — baca yang relevan dengan task.

## Tentang Project

Travelink adalah sistem marketplace pemandu wisata berbasis web dengan fitur Smart Open Trip untuk pembentukan grup wisata otomatis. Ini project skripsi (Teknik Informatika, Universitas Bina Nusantara). Deadline: 18 Juni 2026.

Konsep inti: menghubungkan wisatawan dengan pemandu wisata lokal terverifikasi. Fitur unggulan adalah Smart Open Trip yang membentuk grup wisata otomatis menggunakan algoritma Profile Matching berdasarkan kecocokan preferensi (destinasi, tanggal, budget, minat).

## Arsitektur (PENTING)

Project ini DECOUPLED / HEADLESS, bukan Laravel monolith:

- `backend/`  → Laravel, KHUSUS sebagai REST API (tidak pakai Blade untuk UI)
- `frontend/` → React + Vite + TypeScript, consume API backend via Axios

Frontend dan backend jalan terpisah:
- Backend API: biasanya http://localhost:8000 (php artisan serve)
- Frontend dev: biasanya http://localhost:5173 (npm run dev / vite)

Saat menambah fitur, biasanya butuh kerja di KEDUA sisi: bikin/ubah endpoint di backend, lalu panggil & render di frontend. Selalu pastikan kontrak API (request/response shape) konsisten antara dua sisi.

## Role Pengguna

1. Wisatawan (Tourist) — cari & booking tour, gabung open trip, beri review
2. Pemandu Wisata (Guide) — kelola paket tour, terima booking, perlu verifikasi KYC
3. Administrator — verifikasi pemandu, kelola user & sistem

## Fitur Utama

- Autentikasi & registrasi (3 role) — rencana pakai Laravel Sanctum (BELUM FINAL, boleh diganti)
- Verifikasi KYC pemandu oleh admin (upload dokumen → review → approved/rejected)
- Pencarian & filter tour/pemandu (lokasi, rating, kategori, harga)
- Manajemen paket tour (CRUD oleh pemandu)
- Booking Private Trip (search → booking → konfirmasi pemandu → payment)
- Smart Open Trip (booking → waiting room → kuota terpenuhi → split bill otomatis)
- Algoritma Profile Matching (hitung skor kecocokan untuk grup open trip)
- Sistem pembayaran (simulasi/escrow, tanpa payment gateway asli)
- Review & rating (setelah trip selesai)
- Dashboard admin

## Status Saat Ini (UPDATE BAGIAN INI)

Website ~40% selesai.

SUDAH jalan:
- [isi: misal auth, dst]

BELUM jalan:
- [isi: misal Smart Open Trip, Profile Matching, payment, dst]

## Aturan Umum

- Bahasa UI: Indonesia. Komentar kode konsisten (pilih satu: Inggris atau Indonesia)
- Untuk fitur baru, baca dulu kode existing yang relevan biar polanya konsisten
- Jelaskan rencana dulu untuk perubahan besar (multi-file / lintas backend-frontend)
- Jangan hapus/ubah fitur yang sudah jalan tanpa konfirmasi
- Algoritma Profile Matching = bagian paling penting untuk skripsi. Kerjakan hati-hati & jelaskan logikanya
- JANGAN pernah baca atau commit file .env (ada kredensial database)

## Catatan

- Ada file AXIOS_SETUP_GUIDE.md di root — panduan koneksi frontend ke backend
- Gunakan .git yang sudah ada untuk version control

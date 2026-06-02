# CLAUDE.md — Frontend (React + Vite + TypeScript)

Sub-briefing untuk folder `frontend/`. Baca CLAUDE.md root dulu untuk konteks keseluruhan.

## Peran Folder Ini

Single Page Application (SPA) yang jadi seluruh antarmuka Travelink. Mengambil semua data dari backend Laravel API via HTTP (Axios). Tidak ada logika bisnis berat di sini — itu tugas backend.

## Tech Stack

- React [isi versi, cek package.json]
- Vite (build tool & dev server)
- TypeScript
- Axios (HTTP client untuk panggil API)
- [isi kalau ada: React Router, state management (Redux/Zustand/Context), UI library (Tailwind/MUI/shadcn), dll]

## Konvensi

- Komponen di src/, penamaan PascalCase (misal TourCard.tsx)
- Pakai TypeScript types/interfaces untuk shape data dari API — bikin types yang cocok dengan response backend
- Semua panggilan API lewat satu instance Axios terpusat (base URL dari env), jangan hardcode URL di tiap komponen
- Base URL API ambil dari file .env (misal VITE_API_URL) — jangan hardcode http://localhost:8000
- Responsive design wajib (desktop, tablet, mobile) — ini requirement skripsi
- Bahasa UI: Indonesia

## Hubungan dengan Backend

- Untuk tiap fitur, frontend memanggil endpoint yang ada di backend/routes/api.php
- Kalau endpoint belum ada, koordinasikan: bikin dulu di backend, baru consume di sini
- Pastikan TypeScript interface di frontend cocok dengan JSON response backend
- Token auth (Sanctum) disimpan & dikirim di header Authorization tiap request

## Struktur (UPDATE SESUAI PUNYA LO)

- src/[isi: components, pages, services/api, hooks, types, dll]

## Perintah Penting

- Jalankan dev server: `npm run dev` (default port 5173)
- Build production: `npm run build`
- Install package: `npm install nama-package`
- Lint: `npm run lint`

## Catatan

- Lihat AXIOS_SETUP_GUIDE.md di root project untuk panduan koneksi ke backend

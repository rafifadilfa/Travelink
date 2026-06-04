# CLAUDE.md — Frontend (React + Vite + TypeScript)

Sub-briefing untuk folder `frontend/`. Baca CLAUDE.md root dulu untuk konteks keseluruhan.

## Peran Folder Ini

Single Page Application (SPA) yang jadi seluruh antarmuka Travelink. Mengambil semua data dari backend Laravel API via HTTP (Axios). Tidak ada logika bisnis berat di sini — itu tugas backend.

## Tech Stack

- **React**: 19.x
- **Vite**: 6.2 (build tool & dev server)
- **TypeScript**: 5.8
- **React Router DOM**: 7.5 (client-side routing)
- **Chakra UI**: 2.8.2 (UI component library, Emotion-based)
- **Axios**: 1.9 (HTTP client untuk panggil API)
- **React Icons**: 5.5 (icon library, pakai prefix `Fi` dari Feather Icons)
- **Framer Motion**: 12.x (animasi)
- **React Hook Form**: 7.x (form management)
- **Recharts**: 3.x (chart/grafik — belum dipakai)

## Struktur Halaman (`src/pages/`)

**Tourist (User) Routes:**
| File | Route | Status Koneksi API |
|------|-------|--------------------|
| `Auth.tsx` | `/` | ✅ Terhubung ke `/api/auth/*` |
| `dashboard.tsx` | `/dashboard` | ❌ Mock data hardcode |
| `ViewAllTours.tsx` | `/tours` | ❌ Mock data hardcode |
| `TourDetail.tsx` | `/tours/:id` | ❌ Mock data hardcode |
| `Bookings.tsx` | `/bookings` | ❌ Mock data hardcode |
| `Payment.tsx` | `/payment/:bookingId` | ❌ Mock data hardcode |
| `GuideProfile.tsx` | `/guides/:id` | ❌ Mock data hardcode |
| `Profile.tsx` | `/profile` | ❌ Mock data hardcode |

**Guide Routes:**
| File | Route | Status Koneksi API |
|------|-------|--------------------|
| `GuideAuth.tsx` | `/guide/auth` | ❌ Mock (toast only, tidak kirim request) |
| `GuideDashboard.tsx` | `/guide/dashboard` | ❌ Nama guide hardcode |
| `GuideTours.tsx` | `/guide/tours` | ❌ Mock data hardcode |
| `CreateTour.tsx` | `/guide/tours/new` | ❌ Mock/local state |
| `EditTour.tsx` | `/guide/tours/edit/:tourId` | ❌ Mock/local state |
| `GuideBookings.tsx` | `/guide/bookings` | ❌ Mock data hardcode |
| `GuideEditProfile.tsx` | `/guide/profile` | ❌ Mock/local state |
| `CancelBooking.tsx` | `/guide/bookings/cancel/:bookingId` | ❌ Mock/local state |
| `GuideSettings.tsx` | `/guide/settings` | ❌ Mock/local state |

**Komponen:**
- `GuideLayout.tsx` — sidebar layout untuk semua halaman guide

## Konfigurasi Axios

`Auth.tsx` membuat instance Axios dengan `baseURL: 'http://localhost:8000/api'` secara lokal.

**Yang harus diperbaiki:** Semua panggilan API harus melalui satu instance Axios terpusat dengan base URL dari env. Jangan hardcode URL di tiap komponen. Buat `src/services/api.ts` atau sejenisnya.

Base URL harus dari `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

## Auth Flow (Tourist)

Token Sanctum disimpan di `localStorage`:
- `localStorage.setItem('token', ...)` — saat login/register
- `localStorage.getItem('token')` — untuk cek status login & attach ke header
- Header: `Authorization: Bearer <token>` di setiap request yang butuh auth

## Konvensi

- Komponen di `src/`, penamaan PascalCase (`TourCard.tsx`)
- TypeScript interfaces untuk shape data dari API — cocokkan dengan response backend
- Semua panggilan API lewat instance Axios terpusat (base URL dari `.env`)
- Responsive design wajib (desktop, tablet, mobile) — requirement skripsi
- Bahasa UI: Indonesia
- Styling: Chakra UI props, bukan CSS file terpisah kecuali perlu
- Animasi: Chakra UI `keyframes` dari `@emotion/react`

## Hubungan dengan Backend

- Setiap halaman yang butuh data harus memanggil endpoint dari `backend/routes/api.php`
- Kalau endpoint belum ada di api.php, buat dulu di backend, baru di-consume di sini
- TypeScript interface di frontend harus cocok dengan JSON response backend
- Cek `backend/CLAUDE.md` untuk daftar endpoint yang sudah ada

## Perintah Penting

```bash
npm run dev      # Jalankan dev server (port 5173)
npm run build    # Build production
npm run lint     # Jalankan ESLint
npm install      # Install dependencies
```

## Catatan

- Lihat `AXIOS_SETUP_GUIDE.md` di root project untuk panduan koneksi ke backend
- `ProtectedRoute` di `App.tsx` belum benar-benar cek auth — hanya wrapper kosong. Perlu ditambah logika cek token sebelum fitur auth sensitif dikerjakan
- Settings (`/settings`) masih `ComingSoon` component — belum diimplementasi

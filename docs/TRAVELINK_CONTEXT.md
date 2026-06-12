# Travelink — Project Context (Full)

> Gunakan file ini sebagai konteks awal saat bertanya tentang proyek Travelink di Claude Chat.
> Paste seluruh isi file ini ke Claude, lalu ajukan pertanyaanmu.

---

## 1. Gambaran Umum Proyek

**Travelink** adalah sistem marketplace pemandu wisata berbasis web dengan fitur **Smart Open Trip** — pembentukan grup wisata otomatis menggunakan algoritma Profile Matching (Gap Analysis).

- **Jenis proyek**: Skripsi Teknik Informatika, Universitas Bina Nusantara
- **Deadline**: 18 Juni 2026
- **Developer**: Rafif Irdeva
- **Status**: ~50% selesai (backend API sudah lengkap untuk Guide & Admin; wisatawan belum terhubung ke API)

### Konsep Inti

Menghubungkan wisatawan dengan pemandu wisata lokal terverifikasi. Fitur unggulan (Smart Open Trip) memungkinkan beberapa wisatawan dengan preferensi serupa bergabung dalam satu grup wisata otomatis (split bill).

### Tiga Role Pengguna

| Role | Akses |
|------|-------|
| **Wisatawan (Tourist)** | Cari & booking tour, review, Smart Open Trip |
| **Pemandu (Guide)** | Kelola paket tour, konfirmasi booking, kelola keuangan |
| **Administrator** | Verifikasi KYC pemandu, verifikasi pembayaran & pencairan dana |

---

## 2. Arsitektur

Proyek ini **DECOUPLED / HEADLESS** — backend dan frontend berjalan terpisah:

```
Backend API  →  http://localhost:8000   (Laravel 12, PHP artisan serve)
Frontend SPA →  http://localhost:5173   (React 19, Vite dev server)
```

Backend hanya output JSON via `routes/api.php`. Ada `routes/web.php` (legacy Inertia.js) yang **diabaikan**. Semua fitur baru harus di `routes/api.php` + dikonsumsi oleh frontend React via Axios.

---

## 3. Tech Stack

### Backend — `backend/`

| Komponen | Detail |
|----------|--------|
| Framework | Laravel 12.x |
| Bahasa | PHP 8.3.11 |
| Database | MySQL via XAMPP |
| Auth | Laravel Sanctum (token-based) |
| Payment | Midtrans Snap (simulasi) |
| Testing | Pest |

### Frontend — `frontend/`

| Komponen | Detail |
|----------|--------|
| Framework | React 19.x + TypeScript 5.8 |
| Build Tool | Vite 6.2 (port 5173) |
| Routing | React Router DOM 7.5 |
| UI Library | Chakra UI 2.8.2 |
| HTTP Client | Axios 1.9 |
| Icons | React Icons 5.5 (prefix `Fi` — Feather Icons) |
| Animasi | Framer Motion 12.x |
| Form | React Hook Form 7.x |
| Charts | Recharts 3.x (belum dipakai) |

---

## 4. Database & Models

### 4.1 Models Utama

**Auth Models**

| Model | Guard | Tabel |
|-------|-------|-------|
| `User` | `web` / Sanctum | `users` |
| `Guide` | `guides` / Sanctum | `guides` |
| `Admin` | `admins` / Sanctum | `admins` |

**Tour & Booking**

| Model | Deskripsi |
|-------|-----------|
| `Tour` | Paket wisata (SoftDeletes, `is_open_trip` flag) |
| `TourImage` | Gambar paket wisata |
| `TourCategory` | M2M: tour ↔ category |
| `TourTag` | M2M: tour ↔ tag |
| `TourItem` | M2M: tour ↔ item (included/excluded) |
| `TourItinerary` | Jadwal harian |
| `Booking` | Pesanan private booking |
| `Transaction` | Transaksi pembayaran (kode `INV-YYYYMMDD-XXXX`) |

**Review**

| Model | Deskripsi |
|-------|-----------|
| `TourReview` | Review paket wisata |
| `GuideReview` | Review pemandu (bisa dari private booking atau open trip) |

**Smart Open Trip**

| Model | Deskripsi |
|-------|-----------|
| `OpenTripParticipant` | Peserta dalam pool (status: waiting/matched/cancelled/expired) |
| `OpenTripGroup` | Grup yang terbentuk setelah matching |
| `OpenTripActivity` | Pilihan aktivitas untuk open trip |
| `ParticipantInterest` | M2M: peserta ↔ kategori minat |
| `ParticipantPreference` | M2M: peserta ↔ aktivitas pilihan |

**Keuangan**

| Model | Deskripsi |
|-------|-----------|
| `Withdrawal` | Pengajuan pencairan dana guide |
| `WalletTransaction` | Mutasi saldo (income/withdrawal) |

**Referensi**

| Model | Deskripsi |
|-------|-----------|
| `Location`, `MeetingPoint` | Lokasi & titik kumpul |
| `Category`, `Tag`, `Item`, `DayPhase` | Referensi data tour |
| `Language`, `Speciality` | Profil kemampuan guide |
| `Country`, `PhoneCountryCode`, `PaymentMethod` | Data referensi umum |
| `AppNotification` | Notifikasi sistem (polymorphic) |

### 4.2 Field Penting Guide

```
guides.verification_status:
  'pending'               — baru register
  'menunggu_verifikasi'   — sudah submit KYC, menunggu admin
  'verified'              — disetujui, bisa buat tour
  'rejected'              — ditolak (ada rejection_reason)

guides.pending_balance     — saldo escrow (pembayaran masuk, belum settle)
guides.available_balance   — saldo siap tarik
```

### 4.3 Field Penting Booking

```
bookings.status:
  'menunggu_konfirmasi'          — menunggu guide terima
  'menunggu_pembayaran'          — guide terima, menunggu bayar
  'menunggu_verifikasi_pembayaran' — bukti bayar sudah upload
  'terkonfirmasi'                — admin verifikasi pembayaran
  'selesai'                      — trip selesai
  'dibatalkan'                   — dibatalkan
```

---

## 5. API Endpoints Lengkap

Base URL: `http://localhost:8000/api`

### 5.1 Public (Tidak perlu token)

```
GET  /tours                    — list semua tour published
GET  /tours/{id}               — detail satu tour
GET  /guides                   — daftar top guide (max 6) / search
GET  /guides/{id}              — detail guide + tour list + recent reviews
```

### 5.2 Tourist Auth

```
POST /auth/login               — login wisatawan → {token, user}
POST /auth/register            — registrasi wisatawan → {token, user}
POST /auth/forgot-password     — kirim reset link
POST /auth/logout              — logout (auth:sanctum)
GET  /auth/user                — get user login (auth:sanctum)
```

### 5.3 Tourist Profile (auth:sanctum)

```
GET  /user/profile             — profil + open trip preferences
PUT  /user/profile             — update profil (name, email, phone, ot_*)
POST /user/profile/photo       — upload foto profil
```

### 5.4 Private Booking (auth:sanctum)

```
POST /bookings                 — buat booking baru
GET  /bookings                 — daftar booking user
GET  /bookings/{id}            — detail booking
POST /bookings/{id}/cancel     — cancel booking
POST /bookings/{id}/payment    — generate Midtrans Snap token
GET  /bookings/{id}/payment    — cek status pembayaran ke Midtrans
```

### 5.5 Smart Open Trip (auth:sanctum)

```
GET  /open-trip/form-data                        — data referensi (tour, categories, activities)
POST /open-trip/join                             — daftar peserta + trigger matching otomatis
GET  /open-trip/status                           — cek status peserta (waiting/matched)
GET  /open-trip/group/{groupId}                  — detail grup + anggota + skor kecocokan
GET  /open-trip/my-trips                         — semua open trip yang pernah diikuti
DELETE /open-trip/participants/{id}              — cancel peserta (hanya status=waiting)
POST /open-trip/payment/create                   — buat pembayaran split bill via Midtrans
GET  /open-trip/payment/check/{participantId}    — cek status pembayaran peserta
```

### 5.6 Review (auth:sanctum)

```
POST /reviews/guide            — submit review pemandu
POST /reviews/tour             — submit review paket
GET  /reviews/status           — cek apakah user sudah review booking tertentu
```

### 5.7 Notifikasi (auth:sanctum — semua role)

```
GET  /notifications            — daftar notifikasi (50 terbaru)
PATCH /notifications/read-all  — tandai semua dibaca
PATCH /notifications/{id}/read — tandai satu dibaca
```

### 5.8 Guide Auth

```
POST /guide/auth/register      — registrasi guide
POST /guide/auth/login         — login guide → {token, guide, verification_status}
POST /guide/auth/logout        — logout
GET  /guide/auth/guide         — get guide login
```

### 5.9 Guide Profile (auth:sanctum)

```
GET  /guide/profile            — profil lengkap + completeness status + URLs dokumen
POST /guide/profile            — update info dasar (nama, tarif, bank, foto, bahasa, spesialisasi)
POST /guide/profile/ktp        — upload dokumen KTP
POST /guide/profile/selfie-ktp — upload selfie + KTP
POST /guide/profile/certificate — upload sertifikat
POST /guide/profile/portfolio  — upload portfolio
POST /guide/profile/submit     — submit KYC untuk verifikasi admin
```

### 5.10 Guide Tour Management (auth:sanctum, verified only)

```
GET  /guide/tours              — daftar tour milik guide
POST /guide/tours              — buat tour baru
GET  /guide/tours/{id}         — detail tour untuk form edit
PUT  /guide/tours/{id}         — update tour
DELETE /guide/tours/{id}       — soft delete tour
POST /guide/tours/{id}/images  — upload gambar tour (multipart)
DELETE /guide/tours/{id}/images/{imgId} — hapus satu gambar
```

### 5.11 Guide Booking Management (auth:sanctum, verified only)

```
GET  /guide/bookings                               — daftar pesanan (tab: active|history)
GET  /guide/bookings/{id}                          — detail pesanan
POST /guide/bookings/{id}/accept                   — terima pesanan
POST /guide/bookings/{id}/reject                   — tolak pesanan
POST /guide/open-trip-groups/{id}/confirm          — konfirmasi grup open trip
POST /guide/open-trip-groups/{id}/reject           — tolak grup open trip
```

### 5.12 Guide Keuangan (auth:sanctum, verified only)

```
GET  /guide/reviews            — daftar ulasan + distribusi rating (filter: rating, period)
GET  /guide/wallet             — dashboard keuangan (saldo + riwayat transaksi)
POST /guide/withdrawals        — ajukan pencairan dana
```

### 5.13 Admin Auth

```
POST /admin/auth/login         — login admin
POST /admin/auth/logout        — logout
GET  /admin/auth/admin         — get admin login
```

### 5.14 Admin KYC & User Management (auth:sanctum, admin only)

```
GET  /admin/kyc                — daftar guide pending verifikasi
GET  /admin/kyc/{id}           — detail guide + preview dokumen KYC
GET  /admin/guides             — daftar semua guide (semua status)
GET  /admin/users              — daftar semua wisatawan
POST /admin/kyc/{id}/approve   — setujui guide (status → verified)
POST /admin/kyc/{id}/reject    — tolak guide (status → rejected + reason)
```

### 5.15 Admin Payment Verification (auth:sanctum, admin only)

```
GET  /admin/payments           — daftar pembayaran menunggu verifikasi
GET  /admin/payments/{id}      — detail pembayaran + URL bukti
POST /admin/payments/{id}/verify         — verifikasi pembayaran (creditPending guide)
POST /admin/payments/{id}/reject-payment — tolak bukti pembayaran
```

### 5.16 Admin Withdrawal Verification (auth:sanctum, admin only)

```
GET  /admin/withdrawals           — daftar withdrawal menunggu verifikasi
GET  /admin/withdrawals/{id}      — detail withdrawal
POST /admin/withdrawals/{id}/process — proses pencairan (debitAvailable guide)
POST /admin/withdrawals/{id}/reject  — tolak pencairan
```

---

## 6. Service Classes

### 6.1 WalletService — `app/Services/WalletService.php`

Satu-satunya sumber kebenaran untuk mutasi saldo guide.

```
creditPending(Guide, amount)          — pembayaran masuk → pending_balance naik
settle(Guide, amount, Booking)        — trip selesai → pending→available + wallet_transaction income
settleOpenTrip(Guide, amount, Part.)  — settle untuk open trip
debitAvailable(Guide, Withdrawal)     — pencairan diproses → available_balance berkurang
```

**Alur Saldo**:
1. Admin verifikasi pembayaran → `creditPending()` (pending naik)
2. Trip selesai (command/cron) → `settle()` (pending→available, wallet_transaction income dibuat)
3. Guide ajukan withdrawal → Withdrawal record berstatus menunggu_verifikasi
4. Admin proses pencairan → `debitAvailable()` (available berkurang, wallet_transaction withdrawal dibuat)

### 6.2 ProfileMatchingService — `app/Services/ProfileMatchingService.php`

Algoritma Gap Analysis untuk menghitung skor kecocokan peserta open trip.

**Tabel Bobot Gap**:

| Gap | Bobot |
|-----|-------|
| 0 (tepat sama) | 5.0 |
| +1 | 4.5 |
| -1 | 4.0 |
| +2 | 3.5 |
| -2 | 3.0 |
| +3 | 2.5 |
| -3 | 2.0 |
| ≥ ±4 | 1.5 |

**Kriteria & Bobot**:
- **Core Factor (60%)**: minat (kategori) + aktivitas pilihan → rata-rata
- **Secondary Factor (40%)**: umur + budget level → rata-rata
- **Skor = 0.6 × NCF + 0.4 × NSF**

**Matching untuk kategori**: Ada irisan ≥1 = 5.0, tidak ada irisan = 1.0

**Kompatibel**: match_count ≥ 2 dari 4 kriteria

### 6.3 OpenTripMatchingService — `app/Services/OpenTripMatchingService.php`

Algoritma Greedy Sequential Group Formation.

**Alur**:
1. Ambil peserta berstatus `waiting`, urut created_at ASC (oldest first = anchor)
2. Anchor jadi inti grup sementara
3. Cek setiap peserta lain: jika kompatibel → masuk grup, update profil grup
4. Grup dengan ≥2 anggota → finalisasi (status=matched, countdown mulai)
5. Sisa peserta diproses iterasi berikutnya

**Trigger**: Dipanggil otomatis setiap ada peserta baru daftar via `POST /open-trip/join`

### 6.4 NotificationService — `app/Services/NotificationService.php`

Kirim notifikasi sistem ke semua role via tabel `app_notifications`.

```
send(type, notifiableType, notifiableId, title, message, data)
```

---

## 7. Controllers

### 7.1 Tourist Controllers

| Controller | File | Fungsi |
|-----------|------|--------|
| `AuthApiController` | Api/Auth/ | Login, register, logout, get user |
| `TourListApiController` | Api/Tourist/ | List tour, detail tour |
| `PublicGuideApiController` | Api/Tourist/ | List guide, detail guide |
| `PrivateBookingController` | Api/Tourist/ | CRUD booking, payment Midtrans |
| `OpenTripController` | Api/Tourist/ | Smart Open Trip (join, status, grup, payment) |
| `ReviewApiController` | Api/Tourist/ | Submit review guide & tour |
| `UserProfileApiController` | Api/Tourist/ | Profil wisatawan |

### 7.2 Guide Controllers

| Controller | File | Fungsi |
|-----------|------|--------|
| `GuideApiController` | Api/Auth/ | Login, register, logout guide |
| `GuideProfileApiController` | Api/Guide/ | Profil + KYC upload |
| `GuideTourApiController` | Api/Guide/ | CRUD tour + gambar |
| `GuideBookingApiController` | Api/Guide/ | Kelola pesanan + konfirmasi open trip |
| `GuideReviewApiController` | Api/Guide/ | Daftar ulasan + distribusi rating |
| `GuideWalletApiController` | Api/Guide/ | Dashboard keuangan + riwayat |
| `GuideWithdrawalApiController` | Api/Guide/ | Ajukan pencairan |

### 7.3 Admin Controllers

| Controller | File | Fungsi |
|-----------|------|--------|
| `AdminApiController` | Api/Auth/ | Login, logout admin |
| `AdminKycApiController` | Api/Admin/ | KYC guide + daftar user/guide |
| `AdminPaymentApiController` | Api/Admin/ | Verifikasi pembayaran |
| `AdminWithdrawalApiController` | Api/Admin/ | Verifikasi pencairan |

### 7.4 Notification Controller

| Controller | File | Fungsi |
|-----------|------|--------|
| `NotificationApiController` | Api/ | List, read, read-all notifikasi |

---

## 8. Frontend Pages & Status

### 8.1 Tourist Routes

| File | Route | API Status |
|------|-------|-----------|
| `Auth.tsx` | `/` | ✅ Terhubung ke `/api/auth/*` |
| `dashboard.tsx` | `/dashboard` | ❌ Mock data hardcode |
| `ViewAllTours.tsx` | `/tours` | ❌ Mock data hardcode |
| `TourDetail.tsx` | `/tours/:id` | ❌ Mock data hardcode |
| `Bookings.tsx` | `/bookings` | ❌ Mock data hardcode |
| `Payment.tsx` | `/payment/:bookingId` | ❌ Mock data hardcode |
| `GuideProfile.tsx` | `/guides/:id` | ❌ Mock data hardcode |
| `Profile.tsx` | `/profile` | ❌ Mock data hardcode |
| `SearchResults.tsx` | `/search` | ❌ Mock data hardcode |
| `SmartOpenTripForm.tsx` | `/open-trip/join/:tourId` | ❌ Belum connect API |
| `WaitingRoom.tsx` | `/open-trip/waiting/:participantId` | ❌ Belum connect API |
| `NotificationsPage.tsx` | `/notifications` | ❌ Belum connect API |

### 8.2 Guide Routes

| File | Route | API Status |
|------|-------|-----------|
| `GuideAuth.tsx` | `/guide/auth` | ❌ Mock (toast only) |
| `GuideDashboard.tsx` | `/guide/dashboard` | ❌ Hardcoded |
| `GuideTours.tsx` | `/guide/tours` | ✅ API connected |
| `CreateTour.tsx` | `/guide/tours/new` | ✅ API connected |
| `EditTour.tsx` | `/guide/tours/edit/:tourId` | ✅ API connected |
| `GuideBookings.tsx` | `/guide/bookings` | ✅ API + modal accept/reject |
| `GuideEditProfile.tsx` | `/guide/profile` | ✅ 2-step wizard + KYC upload |
| `GuideReviews.tsx` | `/guide/reviews` | ✅ API connected |
| `GuideWallet.tsx` | `/guide/wallet` | ✅ API connected |
| `GuideSettings.tsx` | `/guide/settings` | ❌ Mock |
| `CancelBooking.tsx` | `/guide/bookings/cancel/:id` | ❌ Mock |

### 8.3 Admin Routes

| File | Route | API Status |
|------|-------|-----------|
| `AdminAuth.tsx` | `/admin/auth` | ❌ Mock |
| `AdminKycList.tsx` | `/admin/kyc` | ✅ API connected |
| `AdminKycDetail.tsx` | `/admin/kyc/:id` | ✅ API connected |
| `AdminGuideList.tsx` | `/admin/guides` | ✅ API connected |
| `AdminPaymentList.tsx` | `/admin/payments` | ✅ API connected |
| `AdminPaymentDetail.tsx` | `/admin/payments/:id` | ✅ API connected |
| `AdminWithdrawalList.tsx` | `/admin/withdrawals` | ✅ API connected |
| `AdminUserList.tsx` | `/admin/users` | ❓ Baru dibuat (status belum jelas) |

### 8.4 Layout Components

| File | Dipakai di |
|------|-----------|
| `TouristNavbar.tsx` | Semua halaman tourist |
| `GuideLayout.tsx` | Semua halaman guide (sidebar) |
| `AdminLayout.tsx` | Semua halaman admin |

---

## 9. Auth & Token Strategy

### Token Storage di localStorage

| Key | Role |
|-----|------|
| `token` | Tourist |
| `guide_token` | Guide |
| `admin_token` | Admin |

### Auth Header

```
Authorization: Bearer <token>
```

### ProtectedRoute

`App.tsx` punya komponen `ProtectedRoute` yang cek token di `localStorage` sebelum render halaman. Redirect ke `/`, `/guide/auth`, atau `/admin/auth` jika belum login.

---

## 10. Smart Open Trip — Alur Lengkap

```
Tahap 1 — Waiting:
  User daftar open trip → POST /open-trip/join
  → OpenTripParticipant dibuat (status=waiting)
  → OpenTripMatchingService.runMatching() dipanggil otomatis
  → Jika ≥2 orang kompatibel → buat OpenTripGroup, status=matched

Tahap 2 — Matched:
  Frontend polling GET /open-trip/status
  → Tampilkan halaman grup (GET /open-trip/group/{id})
  → Tampilkan skor kecocokan per anggota
  → User bayar split bill via POST /open-trip/payment/create (Midtrans)
  → Guide konfirmasi grup POST /guide/open-trip-groups/{id}/confirm

Tahap 3 — Confirmed:
  Trip berjalan
  → Setelah selesai: WalletService.settleOpenTrip() + notifikasi
  → User & guide bisa submit review
```

**Status OpenTripParticipant**: `waiting` → `matched` → `payment_pending` → `paid` → `selesai` / `cancelled` / `expired`

**Status OpenTripGroup**: `active` (countdown) → `confirmed` (guide konfirmasi) → `rejected` / `expired`

---

## 11. Alur Keuangan Lengkap

```
Private Booking:
  User upload bukti bayar
  → Admin verifikasi → bookings.status='menunggu_verifikasi_pembayaran'
  → Admin approve → WalletService.creditPending() → guide.pending_balance naik
  → Trip selesai (artisan command/scheduler) → WalletService.settle() → pending→available
  → Guide ajukan withdrawal → POST /guide/withdrawals
  → Admin setujui → WalletService.debitAvailable() → available berkurang

Open Trip:
  Sama, tapi settle via WalletService.settleOpenTrip() per peserta
```

**Wallet Dashboard Guide**:
- `pending_balance` — escrow (pembayaran masuk, belum settle)
- `available_balance` — siap ditarik
- `total_income` — total penghasilan sepanjang waktu
- `withdrawn` — total yang sudah ditarik

---

## 12. Alur KYC Guide

```
1. Guide register → verification_status='pending'
2. Upload dokumen:
   - POST /guide/profile/ktp          → ktp_path
   - POST /guide/profile/selfie-ktp   → selfie_ktp_path
   - POST /guide/profile/certificate  → certificate_path
   - POST /guide/profile/portfolio    → portfolio_path (optional)
3. Submit → POST /guide/profile/submit → status='menunggu_verifikasi'
4. Admin review → GET /admin/kyc/{id} → lihat dokumen
5. Approve → POST /admin/kyc/{id}/approve → status='verified'
   Reject  → POST /admin/kyc/{id}/reject  → status='rejected' + rejection_reason
6. Hanya verified guide bisa: buat tour, terima booking
```

---

## 13. Konvensi Kode

### Backend

- Semua fitur baru di `routes/api.php` (JSON output)
- Response format: `response()->json(['data' => ..., 'message' => ...])`
- Validasi: Form Request untuk request kompleks
- Auth: `auth:sanctum` untuk semua endpoint yang butuh login
- File upload: disimpan di `storage/app/public/`, diakses via `/storage/`
- SoftDeletes: Tour memakai SoftDeletes (bisa restore)

### Frontend

- TypeScript interfaces harus cocok dengan shape response backend
- Axios instance dengan `baseURL: 'http://localhost:8000/api'` + header `Authorization: Bearer <token>`
- Chakra UI untuk semua UI components
- React Icons dengan prefix `Fi` (Feather Icons)
- Bahasa UI: Indonesia
- Responsive: mobile, tablet, desktop

### Struktur Direktori Backend

```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── Auth/           (AuthApiController, GuideApiController, AdminApiController)
│   │   ├── Tourist/        (TourList, PublicGuide, PrivateBooking, OpenTrip, Review, UserProfile)
│   │   ├── Guide/          (GuideProfile, GuideTour, GuideBooking, GuideReview, GuideWallet, GuideWithdrawal)
│   │   └── Admin/          (AdminKyc, AdminPayment, AdminWithdrawal)
│   ├── Models/
│   ├── Services/
│   └── Middleware/
├── routes/
│   ├── api.php             ← TARGET pengembangan
│   └── web.php             ← legacy, ABAIKAN
└── database/migrations/    (51 file)
```

### Struktur Direktori Frontend

```
frontend/
├── src/
│   ├── pages/              (31 halaman)
│   ├── components/         (3 layout: TouristNavbar, GuideLayout, AdminLayout)
│   └── App.tsx             (routing + ProtectedRoute)
└── [config files]
```

---

## 14. Kredensial Seeder (Development)

| Role | Email | Password | Status |
|------|-------|----------|--------|
| Admin | admin@travelink.com | admin123 | — |
| Guide (Verified) | sarah.johnson@example.com | sarah123 | verified |
| Guide (Pending) | budi.guide@travelink.com | budi123 | pending |
| Guide (Menunggu Verifikasi) | rina.guide@travelink.com | rina123 | menunggu_verifikasi |
| Guide (Ditolak) | doni.guide@travelink.com | doni123 | rejected |

---

## 15. Perintah Development

### Backend

```bash
php artisan serve                          # Jalankan API (port 8000)
php artisan migrate                        # Jalankan migration
php artisan migrate:fresh --seed           # Reset DB + seed ulang
php artisan route:list --path=api          # Lihat semua route API
php artisan optimize:clear                 # Clear semua cache
php artisan make:model Nama -mcr           # Model + migration + controller
php artisan make:resource NamaResource     # API Resource
php artisan make:request NamaRequest       # Form Request
php artisan sanctum:purge-expired          # Hapus token kadaluarsa
```

### Frontend

```bash
npm run dev      # Dev server (port 5173)
npm run build    # Build production
npm run lint     # ESLint
npm install      # Install dependencies
```

---

## 16. Status Implementasi

### ✅ Sudah Selesai & Berjalan

- Backend: Auth Tourist, Guide, Admin (API + frontend terhubung untuk sebagian)
- Backend: Semua 45+ endpoint API (`routes/api.php`)
- Backend: Semua Models + relasi
- Backend: 51 migration files
- Backend: WalletService, ProfileMatchingService, OpenTripMatchingService, NotificationService
- Backend: KYC flow lengkap
- Backend: Smart Open Trip algorithm
- Frontend: Auth wisatawan (login/register)
- Frontend: CRUD tour guide (buat, edit, hapus, upload gambar)
- Frontend: Kelola booking guide (accept/reject)
- Frontend: Edit profil guide + KYC upload (2-step wizard)
- Frontend: Dashboard keuangan guide (wallet + withdrawal)
- Frontend: Ulasan guide
- Frontend: Admin KYC verifikasi
- Frontend: Admin payment verifikasi
- Frontend: Admin withdrawal verifikasi

### ❌ Belum Selesai (Frontend masih mock data)

- Auth guide (form belum kirim request ke API)
- Dashboard wisatawan
- Daftar & detail tour (ViewAllTours, TourDetail)
- Daftar booking wisatawan (Bookings)
- Halaman payment wisatawan
- Profil guide (tampilan publik)
- Profil wisatawan
- Pencarian tour
- Smart Open Trip UI (SmartOpenTripForm, WaitingRoom)
- Halaman notifikasi

### ⚠️ Belum Diimplementasi

- Auth admin (frontend masih mock)
- Artisan command untuk auto-settle income setelah trip selesai
- Email notification
- Real-time notification (WebSocket)

---

## 17. Catatan Penting

- **File `.env`**: Berisi kredensial database — jangan baca atau commit
- **CORS**: Frontend (5173) ≠ Backend (8000) — konfigurasi di `config/cors.php`
- **Image URL**: Backend kembalikan relative path, frontend format dengan `http://localhost:8000/storage/` + path
- **Token kadaluarsa**: Frontend belum ada logika refresh token — jika 401, redirect ke halaman login
- **Legacy `web.php`**: Masih ada route Inertia.js, **abaikan** — bukan target pengembangan
- **`is_open_trip` flag**: Tour punya kolom `is_open_trip` boolean untuk membedakan jenis tour
- **Max group size**: Open trip group dikonfigurasi via `config('open_trip.max_group_size')`
- **Algoritma penting untuk skripsi**: ProfileMatchingService & OpenTripMatchingService adalah bagian akademis paling penting

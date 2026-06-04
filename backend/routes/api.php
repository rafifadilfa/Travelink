<?php

use App\Http\Controllers\Api\Admin\AdminKycApiController;
use App\Http\Controllers\Api\Admin\AdminPaymentApiController;
use App\Http\Controllers\Api\Admin\AdminWithdrawalApiController;
use App\Http\Controllers\Api\Auth\AdminApiController;
use App\Http\Controllers\Api\Auth\AuthApiController;
use App\Http\Controllers\Api\Auth\GuideApiController;
use App\Http\Controllers\Api\Guide\GuideBookingApiController;
use App\Http\Controllers\Api\Guide\GuideProfileApiController;
use App\Http\Controllers\Api\Guide\GuideReviewApiController;
use App\Http\Controllers\Api\Guide\GuideTourApiController;
use App\Http\Controllers\Api\Tourist\OpenTripController;
use App\Http\Controllers\Api\Tourist\TourListApiController;
use App\Http\Middleware\EnsureGuideIsVerified;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;

// ============================================================
// PUBLIC TOUR ROUTES
// ============================================================
Route::get('tours', [TourListApiController::class, 'index']);

// ============================================================
// TOURIST AUTH ROUTES
// ============================================================
Route::middleware('guest')->group(function () {
    Route::post('auth/login',            [AuthApiController::class, 'login']);
    Route::post('auth/register',         [AuthApiController::class, 'register']);
    Route::post('auth/forgot-password',  [AuthApiController::class, 'forgotPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthApiController::class, 'logout']);
    Route::get('auth/user',    [AuthApiController::class, 'getUser']);
});

// ============================================================
// SMART OPEN TRIP ROUTES
// ============================================================
Route::prefix('open-trip')->group(function () {
    // Form data bisa diakses tanpa login (untuk preview), dengan login untuk cek status
    Route::get('form-data', [OpenTripController::class, 'formData']);

    // Endpoint berikut wajib login sebagai wisatawan
    Route::middleware('auth:sanctum')->group(function () {
        // Simpan preferensi & masuk pool — memicu matching otomatis
        Route::post('join', [OpenTripController::class, 'join']);

        // Cek status peserta di pool (Tahap 1 polling)
        Route::get('status', [OpenTripController::class, 'status']);

        // Detail grup + anggota + skor kecocokan (Tahap 2)
        Route::get('group/{groupId}', [OpenTripController::class, 'groupDetail']);

        // Daftar semua Smart Open Trip yang diikuti user login
        Route::get('my-trips', [OpenTripController::class, 'myTrips']);

        // Cancel peserta (hanya Tahap 1 / status = waiting)
        Route::delete('participants/{participantId}', [OpenTripController::class, 'cancel']);

        // Pembayaran split bill (Tahap 2)
        Route::post('payment/create',                  [OpenTripController::class, 'createPayment']);
        Route::get('payment/check/{participantId}',    [OpenTripController::class, 'checkPaymentStatus']);

        // DEBUG SEMENTARA — hapus setelah bug ditemukan
        Route::get('debug-pool', [OpenTripController::class, 'debugPool']);
    });
});

// ============================================================
// GUIDE AUTH ROUTES
// ============================================================
Route::prefix('guide')->group(function () {

    // -- Publik (belum login) --
    Route::middleware('guest')->group(function () {
        Route::post('auth/register', [GuideApiController::class, 'register']);
        Route::post('auth/login',    [GuideApiController::class, 'login']);
    });

    // -- Guide sudah login (token valid, belum tentu verified) --
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [GuideApiController::class, 'logout']);
        Route::get('auth/guide',   [GuideApiController::class, 'getGuide']);

        // UC-12 & UC-13: Profil & KYC — bisa diakses sebelum verified
        Route::get('profile',                  [GuideProfileApiController::class, 'getProfile']);
        Route::post('profile',                 [GuideProfileApiController::class, 'updateProfile']);
        Route::post('profile/ktp',             [GuideProfileApiController::class, 'uploadKtp']);
        Route::post('profile/selfie-ktp',      [GuideProfileApiController::class, 'uploadSelfieKtp']);
        Route::post('profile/certificate',     [GuideProfileApiController::class, 'uploadCertificate']);
        Route::post('profile/portfolio',       [GuideProfileApiController::class, 'uploadPortfolio']);
        // UC-12: tombol "Kirim untuk Diverifikasi"
        Route::post('profile/submit',          [GuideProfileApiController::class, 'submitForVerification']);

        // -- Hanya guide dengan status 'verified' --
        Route::middleware(EnsureGuideIsVerified::class)->group(function () {

            // UC-14: Manajemen Paket Wisata
            // GET /api/guide/tours/reference sebelum /tours/{id} agar tidak tertangkap sebagai {id}
            Route::get('tours/reference',   [GuideTourApiController::class, 'reference']);
            Route::get('tours',             [GuideTourApiController::class, 'index']);
            Route::post('tours',            [GuideTourApiController::class, 'store']);
            Route::get('tours/{id}',        [GuideTourApiController::class, 'show']);
            Route::put('tours/{id}',        [GuideTourApiController::class, 'update']);
            Route::delete('tours/{id}',     [GuideTourApiController::class, 'destroy']);

            // UC-21 & UC-15: Manajemen Pesanan Masuk
            Route::get('bookings',              [GuideBookingApiController::class, 'index']);
            Route::get('bookings/{id}',         [GuideBookingApiController::class, 'show']);
            Route::post('bookings/{id}/accept', [GuideBookingApiController::class, 'accept']);
            Route::post('bookings/{id}/reject', [GuideBookingApiController::class, 'reject']);

            // UC-16: Ulasan & Rating
            Route::get('reviews', [GuideReviewApiController::class, 'index']);

            // UC-22: Dashboard Keuangan
            Route::get('wallet', [GuideWalletApiController::class, 'index']);

            // UC-17: Pencairan Dana
            Route::post('withdrawals', [GuideWithdrawalApiController::class, 'store']);
        });
    });
});

// ============================================================
// ADMIN ROUTES
// ============================================================
Route::prefix('admin')->group(function () {

    // -- Login admin --
    Route::post('auth/login', [AdminApiController::class, 'login']);

    // -- Admin sudah login --
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AdminApiController::class, 'logout']);
        Route::get('auth/admin',   [AdminApiController::class, 'getAdmin']);

        Route::middleware(EnsureIsAdmin::class)->group(function () {

            // UC-19: Verifikasi KYC
            Route::get('kyc',                   [AdminKycApiController::class, 'index']);
            Route::get('kyc/{id}',              [AdminKycApiController::class, 'show']);
            Route::post('kyc/{id}/approve',     [AdminKycApiController::class, 'approve']);
            Route::post('kyc/{id}/reject',      [AdminKycApiController::class, 'reject']);
            Route::get('guides',                [AdminKycApiController::class, 'allGuides']);

            // UC-18: Verifikasi Pembayaran
            Route::get('payments',                      [AdminPaymentApiController::class, 'index']);
            Route::get('payments/{id}',                 [AdminPaymentApiController::class, 'show']);
            Route::post('payments/{id}/verify',         [AdminPaymentApiController::class, 'verify']);
            Route::post('payments/{id}/reject-payment', [AdminPaymentApiController::class, 'rejectPayment']);

            // UC-20: Verifikasi Pencairan Dana
            Route::get('withdrawals',                   [AdminWithdrawalApiController::class, 'index']);
            Route::get('withdrawals/{id}',              [AdminWithdrawalApiController::class, 'show']);
            Route::post('withdrawals/{id}/process',     [AdminWithdrawalApiController::class, 'process']);
            Route::post('withdrawals/{id}/reject',      [AdminWithdrawalApiController::class, 'reject']);
        });
    });
});

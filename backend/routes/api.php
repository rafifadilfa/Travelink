<?php

use App\Http\Controllers\Api\Admin\AdminKycApiController;
use App\Http\Controllers\Api\Auth\AdminApiController;
use App\Http\Controllers\Api\Auth\AuthApiController;
use App\Http\Controllers\Api\Auth\GuideApiController;
use App\Http\Controllers\Api\Guide\GuideProfileApiController;
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

    // Endpoint publik (belum login)
    Route::middleware('guest')->group(function () {
        Route::post('auth/register', [GuideApiController::class, 'register']);
        Route::post('auth/login',    [GuideApiController::class, 'login']);
    });

    // Endpoint untuk guide yang sudah login (token valid)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [GuideApiController::class, 'logout']);
        Route::get('auth/guide',   [GuideApiController::class, 'getGuide']);

        // Profil guide — bisa diakses meski masih pending (untuk isi data KYC)
        Route::get('profile',                  [GuideProfileApiController::class, 'getProfile']);
        Route::post('profile',                 [GuideProfileApiController::class, 'updateProfile']);
        Route::post('profile/ktp',             [GuideProfileApiController::class, 'uploadKtp']);
        Route::post('profile/certificate',     [GuideProfileApiController::class, 'uploadCertificate']);

        // Endpoint yang HANYA bisa diakses guide dengan status 'verified'
        Route::middleware(EnsureGuideIsVerified::class)->group(function () {
            Route::get('tours',           [GuideTourApiController::class, 'index']);
            Route::post('tours',          [GuideTourApiController::class, 'store']);
            Route::get('tours/{id}',      [GuideTourApiController::class, 'show']);
            Route::put('tours/{id}',      [GuideTourApiController::class, 'update']);
            Route::delete('tours/{id}',   [GuideTourApiController::class, 'destroy']);
        });
    });
});

// ============================================================
// ADMIN ROUTES
// ============================================================
Route::prefix('admin')->group(function () {

    // Login admin — endpoint publik
    Route::post('auth/login', [AdminApiController::class, 'login']);

    // Semua endpoint di bawah butuh token Sanctum yang valid
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AdminApiController::class, 'logout']);
        Route::get('auth/admin',   [AdminApiController::class, 'getAdmin']);

        // KYC management — hanya untuk admin (dicek oleh EnsureIsAdmin)
        Route::middleware(EnsureIsAdmin::class)->group(function () {
            Route::get('kyc',                   [AdminKycApiController::class, 'index']);
            Route::get('kyc/{id}',              [AdminKycApiController::class, 'show']);
            Route::post('kyc/{id}/approve',     [AdminKycApiController::class, 'approve']);
            Route::post('kyc/{id}/reject',      [AdminKycApiController::class, 'reject']);
            Route::get('guides',                [AdminKycApiController::class, 'allGuides']);
        });
    });
});

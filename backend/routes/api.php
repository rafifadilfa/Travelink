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
use App\Http\Controllers\Api\Guide\GuideWalletApiController;
use App\Http\Controllers\Api\Guide\GuideWithdrawalApiController;
use App\Http\Controllers\Api\MidtransCallbackController;
use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\Api\Tourist\OpenTripController;
use App\Http\Controllers\Api\Tourist\PrivateBookingController;
use App\Http\Controllers\Api\Tourist\ReviewApiController;
use App\Http\Controllers\Api\Tourist\TourListApiController;
use App\Http\Controllers\Api\Tourist\PublicGuideApiController;
use App\Http\Controllers\Api\Tourist\UserProfileApiController;
use App\Http\Middleware\EnsureGuideIsVerified;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;

// ============================================================
// PUBLIC TOUR ROUTES
// ============================================================
Route::get('tours',                        [TourListApiController::class, 'index']);
Route::get('tours/{id}',                   [TourListApiController::class, 'show']);
Route::get('tours/{id}/availabilities',    [TourListApiController::class, 'availabilities']);

// ============================================================
// PUBLIC GUIDE ROUTES
// ============================================================
Route::get('guides',      [PublicGuideApiController::class, 'index']);
Route::get('guides/{id}', [PublicGuideApiController::class, 'show']);

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

    // Profil wisatawan
    Route::get('user/profile',        [UserProfileApiController::class, 'show']);
    Route::put('user/profile',        [UserProfileApiController::class, 'update']);
    Route::post('user/profile/photo', [UserProfileApiController::class, 'uploadPhoto']);
});

// ============================================================
// NOTIFICATION ROUTES (semua role — user, guide, admin)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('notifications',              [NotificationApiController::class, 'index']);
    Route::patch('notifications/read-all',   [NotificationApiController::class, 'markAllRead']);
    Route::patch('notifications/{id}/read',  [NotificationApiController::class, 'markRead']);
});

// ============================================================
// PAYMENT WEBHOOK — Midtrans callback (TC-047)
// Tidak butuh auth — Midtrans mengirim POST langsung ke endpoint ini.
// Verifikasi dilakukan via signature key di controller.
// ============================================================
Route::post('payment/midtrans/callback', [MidtransCallbackController::class, 'handle']);

// ============================================================
// REVIEW & RATING ROUTES (Tourist)
// ============================================================
Route::prefix('reviews')->middleware('auth:sanctum')->group(function () {
    Route::post('guide',  [ReviewApiController::class, 'submitGuideReview']);
    Route::post('tour',   [ReviewApiController::class, 'submitTourReview']);
    Route::get('status',  [ReviewApiController::class, 'reviewStatus']);
});

// ============================================================
// PRIVATE BOOKING ROUTES (Tourist)
// ============================================================
Route::prefix('bookings')->middleware('auth:sanctum')->group(function () {
    Route::post('/',                         [PrivateBookingController::class, 'store']);
    Route::get('/',                          [PrivateBookingController::class, 'index']);
    Route::get('/{id}',                      [PrivateBookingController::class, 'show']);
    Route::post('/{id}/cancel',              [PrivateBookingController::class, 'cancel']);
    Route::post('/{id}/payment',             [PrivateBookingController::class, 'createPayment']);
    Route::get('/{id}/payment',              [PrivateBookingController::class, 'checkPayment']);
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

        // TC-056: Konfirmasi keikutsertaan dalam window 6 jam setelah countdown habis
        Route::post('confirm', [OpenTripController::class, 'confirm']);

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
        Route::get('profile',                    [GuideProfileApiController::class, 'getProfile']);
        Route::post('profile',                   [GuideProfileApiController::class, 'updateProfile']);
        Route::post('profile/ktp',               [GuideProfileApiController::class, 'uploadKtp']);
        Route::post('profile/selfie-ktp',        [GuideProfileApiController::class, 'uploadSelfieKtp']);
        Route::post('profile/certificate',       [GuideProfileApiController::class, 'uploadCertificate']);
        Route::post('profile/portfolio',         [GuideProfileApiController::class, 'uploadPortfolio']);
        Route::post('profile/submit',            [GuideProfileApiController::class, 'submitKyc']);

        // Endpoint yang HANYA bisa diakses guide dengan status 'verified'
        Route::middleware(EnsureGuideIsVerified::class)->group(function () {
            // Tour management
            Route::get('tours',                    [GuideTourApiController::class, 'index']);
            Route::post('tours',                   [GuideTourApiController::class, 'store']);
            Route::get('tours/{id}',               [GuideTourApiController::class, 'show']);
            Route::put('tours/{id}',               [GuideTourApiController::class, 'update']);
            Route::post('tours/{id}',              [GuideTourApiController::class, 'update']); // method override dari PUT via FormData
            Route::delete('tours/{id}',            [GuideTourApiController::class, 'destroy']);
            Route::post('tours/{id}/images',              [GuideTourApiController::class, 'uploadImages']);
            Route::delete('tours/{id}/images/{imageId}',  [GuideTourApiController::class, 'destroyImage']);

            // Booking management
            Route::get('bookings',                    [GuideBookingApiController::class, 'index']);
            Route::get('bookings/{id}',               [GuideBookingApiController::class, 'show']);
            Route::post('bookings/{id}/accept',       [GuideBookingApiController::class, 'accept']);
            Route::post('bookings/{id}/reject',       [GuideBookingApiController::class, 'reject']);

            // Smart Open Trip — tolak / konfirmasi grup
            Route::post('open-trip-groups/{groupId}/reject',  [GuideBookingApiController::class, 'rejectOpenTripGroup']);
            Route::post('open-trip-groups/{groupId}/confirm', [GuideBookingApiController::class, 'confirmOpenTripGroup']);

            // Ulasan & rating
            Route::get('reviews',                     [GuideReviewApiController::class, 'index']);

            // Dashboard keuangan
            Route::get('wallet',                      [GuideWalletApiController::class, 'index']);

            // Pencairan dana
            Route::post('withdrawals',                [GuideWithdrawalApiController::class, 'store']);
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

        Route::middleware(EnsureIsAdmin::class)->group(function () {

            // UC-19: Verifikasi KYC
            Route::get('kyc',                   [AdminKycApiController::class, 'index']);
            Route::get('kyc/{id}',              [AdminKycApiController::class, 'show']);
            Route::post('kyc/{id}/approve',     [AdminKycApiController::class, 'approve']);
            Route::post('kyc/{id}/reject',      [AdminKycApiController::class, 'reject']);
            Route::get('guides',                [AdminKycApiController::class, 'allGuides']);
            Route::get('users',                 [AdminKycApiController::class, 'usersList']);

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

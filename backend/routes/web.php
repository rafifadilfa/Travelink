<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Tour;
use App\Models\TourTag;
use App\Models\TourImage;
use App\Models\Booking;
use App\Models\Transaction;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\ViewAllTourController;
use App\Http\Controllers\TourDetailController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuideProfileController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TourReviewController;
use App\Http\Controllers\GuideDashboardController;
use App\Http\Controllers\Auth\GuideAuthController;
use App\Http\Controllers\Auth\RegisteredGuideController;
use App\Http\Controllers\GuideSettingController;
use App\Http\Controllers\CancelBookingController;
use App\Http\Controllers\GuideTourController;
use App\Http\Controllers\EditTourController;
use App\Http\Controllers\CreateNewTourController;


// 1. Homepage Route
// This will redirect users to the correct page based on their login status.
Route::get('/', function () {
    if (Auth::guard('web')->check()) {
        return redirect()->route('dashboard.view');
    }

    else if (Auth::guard('guides')->check()) {
        return redirect()->route('guide.dashboard');
    }

    return redirect()->route('login');
})->name('login');

Route::middleware(['auth:web', 'verified'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('profile', [UserProfileController::class, 'view'])->name('Profile.view');
    Route::patch('profile', [UserProfileController::class, 'update'])->name('Profile.update');
    Route::post('/profile/photo', [UserProfileController::class, 'updatePhoto'])->name('profile.photo.update');
    Route::get('dashboard', [DashboardController::class, 'view'])->name('dashboard.view');
    Route::get('ViewAllTour', [ViewAllTourController::class, 'view'])->name('Tours.view');
    Route::get('/tours/{tour}', [TourDetailController::class, 'show'])->name('tour.show');
    Route::get('Bookings', [BookingController::class, 'view'])->name('Bookings');
    Route::post('TourReview', [TourReviewController::class, 'create'])->name('TourReview.create');
    Route::get('/GuideProfile/{guide}', [GuideProfileController::class, 'user_view'])->name('guideprofile.userview');
    Route::get('/Payment/{transaction}/Payment-Details', [PaymentController::class, 'view'])->middleware('nocache')->name('Payment.create');
    Route::post('/transaction/create', [TransactionController::class, 'store'])->name('transaction.store');
    Route::post('/transaction/update', [TransactionController::class, 'update'])->name('transaction.update');
    Route::post('CancelBooking/submit', [CancelBookingController::Class, 'user_cancel_booking'])->name('user.cancel.booking.submit');
});

Route::prefix('guide')->name('guide.')->middleware(['auth:guides'])->group(function () {
    Route::get('dashboard', [GuideDashboardController::class, 'view'])->name('dashboard');
    Route::post('logout', [GuideAuthController::class, 'destroy'])->name('logout');
    Route::get('setting', [GuideSettingController::class, 'view'])->name('setting');
    Route::get('profile', [GuideProfileController::class, 'guide_view'])->name('profile');
    Route::patch('profileUpdate', [GuideProfileController::class, 'guide_update'])->name('profile.update');
    Route::post('profilePhotoUpdate', [GuideProfileController::class, 'guide_updatePhoto'])->name('profile.photo.update');
    Route::get('bookings', [BookingController::class, 'guide_view'])->name('bookings');
    Route::patch('updateBookingStatus', [BookingController::class, 'guide_booking_status_update'])->name('booking.status.update');
    Route::get('CancelBooking/{transaction}', [CancelBookingController::class, 'show'])->name('cancel.booking.show');
    Route::post('CancelBooking/submit', [CancelBookingController::Class, 'guide_cancel_booking'])->name('cancel.booking.submit');
    Route::get('tours', [GuideTourController::class, 'show'])->name('tours.show');
    Route::get('tourDetails/{tour}', [GuideTourController::class, 'tour_details'])->name('tour.details')->withTrashed();
    Route::delete('deleteTour/{tour}', [GuideTourController::class, 'soft_delete'])->name('delete.tour');
    Route::post('restoreTour/{tour}', [GuideTourController::class, 'restore_tour'])->name('restore.tour')->withTrashed();
    Route::get('editTour/{tour}', [EditTourController::class, 'show_edit_tour'])->name('edit.tour.show')->withTrashed();
    Route::post('editTourUpdate', [EditTourController::class, 'update_tour_details'])->name('edit.tour.update')->withTrashed();
    Route::get('createNewTour', [CreateNewTourController::class, 'show_create_tour'])->name('create.tour.show');
    Route::post('createNewTourSubmit', [CreateNewTourController::class, 'create_new_tour'])->name('create.tour.submit');
});

// --- User Authentication Routes ---
Route::middleware(['guest:web', ('nocache')])->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
});

Route::prefix('guide')->name('guide.')->middleware(['guest:guides', 'nocache'])->group(function () {
    Route::get('login', [GuideAuthController::class, 'create'])->name('login');
    Route::post('login', [GuideAuthController::class, 'store']);
    Route::get('register', [RegisteredGuideController::class, 'create'])->name('register');
    Route::post('register', [RegisteredGuideController::class, 'store']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

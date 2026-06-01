<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Booking;

class BookingController extends Controller
{
    public function view(){
        $user = Auth::Guard('web')->user();
        $transactions = Transaction::with([
            'guide.reviews',
            'tour.images',
            'tour.location',
            'tour.meetingPoint',
            'tour.reviews',
            'paymentMethod',
            'booking',
        ])->where('user_id', $user->id)->get();

        return Inertia::render('Bookings', [
            'user' => $user,
            'transactions' => $transactions,
        ]);
    }

    public function guide_view(){
        $guide = Auth::Guard('guides')->User();
        $transactions = Transaction::with([
            'user',
            'tour.location',
            'tour.meetingPoint',
            'booking',
        ])->where('guide_id', $guide->id)->get();

        return Inertia::render('GuideBookings', [
            'guide' => $guide,
            'transactions' => $transactions,
        ]);
    }

    public function guide_booking_status_update(Request $request, Booking $booking){

        $guide = Auth::guard('guides')->User();
        $transaction = Transaction::findOrFail($request->transaction_id);
        $booking = Booking::where('transaction_id', '=' ,$transaction->id);

        if ($transaction->guide_id !== $guide->id) {
            abort(403);
        }

        $booking->update(['booking_status' => 'confirmed']);

        return back();
    }
}

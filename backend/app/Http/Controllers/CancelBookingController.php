<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Booking;

class CancelBookingController extends Controller
{
    public function show(Transaction $transaction){

        $guide = Auth::guard('guides')->User();
        $transaction->load(['user', 'tour', 'booking'])->where('guide_id', $guide->id)->get();

        if($transaction->booking->booking_status === 'cancelled'){
            return redirect()->route('guide.bookings')->with('error', 'You have already cancelled this booking');
        }

        return Inertia::render('CancelBooking', [
            'guide' => $guide,
            'transaction' => $transaction,
        ]);
    }

    public function guide_cancel_booking(Request $request){

        $guide = Auth::guard('guides')->User();

        $transaction = Transaction::findOrFail($request->transactionID);

        if($transaction->guide_id !== $request->guideID || $guide->id !== $request->guideID){
            abort(403);
        }

        $booking = Booking::findOrFail($request->bookingID);

        if($transaction->id !== $booking->transaction_id){
            abort(403);
        }

        if($booking->booking_status === 'cancelled'){
            return redirect()->route('guide.bookings')->with('error', 'You have already cancelled this booking');
        }

        $booking->update([
            'cancelation_reason' => $request->cancelation_reason,
            'booking_status' => 'canceled'
            ]);

        return redirect()->route('guide.bookings')->with('success', 'booking successfully cancelled');
    }

    public function user_cancel_booking(Request $request){

        $user = Auth::guard('web')->User();

        $transaction = Transaction::findOrFail($request->transactionID);

        if($transaction->user_id !== $user->id){
            abort(403);
        }

        $booking = Booking::findOrFail($request->bookingID);

        if($transaction->id !== $booking->transaction_id){
            abort(403);
        }

        if($booking->booking_status === 'cancelled'){
            return back()->with('error', 'You have already cancelled this booking');
        }

        $booking->update([
            'cancelation_reason' => $request->cancelation_reason,
            'booking_status' => 'canceled'
            ]);

        return back()->with('success', 'Tour has been canceled');
    }
}

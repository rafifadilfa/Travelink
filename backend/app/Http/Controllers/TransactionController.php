<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Tour;
use App\Models\Booking;
use App\Models\Transaction;
use App\Models\PaymentMethod;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        // dd($request);

        $tour = Tour::find($request->tour_id);
        $user = Auth::User();
        $tour_date = $request->tour_date;
        $participant = $request->participant;

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'guide_id' => $tour->tour_guide_id,
            'tour_id' => $tour->id,
            'participant_count' => $participant,
            'price_per_participant' => $tour->tour_price,
            'tour_date' => $tour_date,
            'payment_status' => 'unpaid',
            'total_amount' => $tour->tour_price * $participant,
            ]);

        if($transaction){

            $booking = Booking::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
                'booking_status' => 'pending',
                'tour_reviewed' => false,
                'guide_reviewd' => false,
            ]);
        }
        
        // The key change: Redirect to the payment page for this new transaction
        return redirect()->route('Payment.create', ['transaction' => $transaction->id]);
    }

    public function update(Request $request){

        $transaction = Transaction::find($request->transaction_id);

        if($transaction->payment_status === 'paid' && $transaction->payment_method_id){
            return redirect()->route('Bookings')->with('error', 'You have already paid this booking.');
        }

        $paymentMethod = PaymentMethod::find($request->payment_method_id);

        if($transaction && $paymentMethod){
            
            $transaction->update([
            'payment_status' => 'paid',
            'payment_method_id' => $paymentMethod->id,
            ]);
        }

        return redirect()->route('Bookings')->with('success', 'Payment Successfull');
    }
}

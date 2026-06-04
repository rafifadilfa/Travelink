<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TourReview;
use App\Models\Booking;
use Inertia\Inertia;


class TourReviewController extends Controller
{
    public function create(Request $request){

        $request->validate([
            'transactionID' => 'required|exists:transactions,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string',
        ]);

        $transaction_id = $request->input('transactionID');

        $transaction = Transaction::with('booking', 'tour.reviews')->findOrFail($transaction_id);
        
        if($transaction->booking->booking_status !== 'completed'){

            return back()->with('error', 'Tour is not completed yet!');
        }

        if($transaction->tour->reviews()->where('transaction_id', $transaction->id)->exists()){

            return back()->with('error', 'This Tour has been reviewed');
        }
        
        $TourReview = TourReview::create([
            'transaction_id' => $transaction->id,
            'tour_id' => $transaction->tour_id,
            'user_id' => $transaction->user_id,
            'rating' => $request->rating,
            'comment' => $request->review,
        ]);

        if($TourReview){

            $transaction->booking->update(['tour_reviewed' => true]);
            $tour = $transaction->tour;

            $rating = $tour->reviews()->avg('rating');
            $tour->update(['tour_rating' => $rating]);

            return back()->with('success', 'Tour Review Posted!');

        }else{

            return back()->with('error', 'Tour Review Error Something Went Wrong!');

        }
    }
}

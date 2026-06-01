<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Tour;
use App\Models\Guide;


class DashboardController extends Controller
{
    public function view(){
        $user = Auth::user();
        $guides = Guide::orderBy('rating', 'DESC')->orderBy('review', 'DESC')->take(1)->get();
        $tours = Tour::with(['images', 'tags'])->take(1)->get();
        $transactions = Transaction::with([
            'guide',
            'tour.images',
            'tour.location',
            'tour.meetingPoint',
            'paymentMethod',
            'booking'
            ])->where('user_id', $user->id)->get();
        
            // dd($transactions, $guides);

        return Inertia::render('dashboard', [
            'user' => Auth::user(),
            'tours' => $tours,
            'featuredGuides' => $guides,
            'transactions' => $transactions,
        ]);
    }
}

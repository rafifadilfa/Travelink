<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Guide;
use App\Models\Transaction;
use App\Models\User;

class GuideBookingsController extends Controller
{
    public function view(){
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
}

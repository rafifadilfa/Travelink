<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Tour;
use App\Models\Guide;
use App\Models\Transaction;
use App\Models\PaymentMethod;

class PaymentController extends Controller
{
    public function view(Transaction $transaction){

        if ($transaction->payment_status === 'paid') {
        // Redirect to a relevant page with a message.
        return redirect()->route('Bookings')->with('error', 'You have already paid this booking');
        }

        $transaction->load(['tour']);
        $user = Auth::User();
        $payment_methods = PaymentMethod::all();

        return Inertia::render('Payment',[
            'user' => $user,
            'transaction' => $transaction,
            'payment_methods' => $payment_methods,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Tour;

class ViewAllTourController extends Controller
{
    public function view(){
        $user = Auth::user();
        $tours = Tour::with(['images', 'tags', 'location', 'categories'])->take(1)->get();
        return inertia::render('ViewAllTours', [
            'user' => $user,
            'tours' => $tours,
        ]);
    }
}

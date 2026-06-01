<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Tour;

class TourDetailController extends Controller
{
    public function show(Tour $tour)
    {
        $tour->load(['images', 'tags', 'location', 'categories', 'itineraries', 'items', 'guide']);
        $user = Auth::User();

        // Render the TourDetail component and pass the tour data as a prop.
        return Inertia::render('TourDetail', [
            'user' => $user,
            'tour' => $tour
        ]);
    }
}

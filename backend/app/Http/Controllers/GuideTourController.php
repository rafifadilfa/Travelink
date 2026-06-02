<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\Tour;

class GuideTourController extends Controller
{
    public function show(){

        $guide = Auth::guard('guides')->User();

        $tours = Tour::where('tour_guide_id', $guide->id)->withTrashed()->withCount('transactions')->get();

        return Inertia::render('GuideTours', [
            'guide' => $guide,
            'tours' => $tours,
        ]);

    }

    public function tour_details(Tour $tour){

        $tour->load(['images', 'tags', 'location', 'categories', 'itineraries', 'items', 'guide']);
        $tour->loadCount('transactions');

        return Inertia::render('GuideTourDetail', [
            'tour' => $tour
        ]);

    }

    public function soft_delete(Tour $tour)
    {

        $tour->update(['tour_status' => 'disabled']);
        $tour->delete();
        return back();

    }

    public function restore_tour(Tour $tour)
    {

        $tour->restore(); 
        $tour->update(['tour_status' => 'published']);
        return back();

    }
}

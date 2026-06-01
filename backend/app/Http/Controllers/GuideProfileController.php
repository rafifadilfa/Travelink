<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Guide;
use App\Models\User;
use App\Models\Language;
use App\Models\Speciality;
use Illuminate\Support\Facades\Storage;

class GuideProfileController extends Controller
{
    public function user_view(Guide $guide){
        $guide->load(['tours.dayphase', 'specialities', 'languages', 'country']);
        $user = Auth::Guard('web')->User();

        // dd($guide);

        return Inertia::render('GuideProfile', [
            'guide' => $guide,
            'languages' => Language::all(),
            'user' => $user,
        ]);
    }

    public function guide_view(){
        $guide = Auth::Guard('guides')->User();
        $guide->load(['languages', 'specialities']);

        return Inertia::render('GuideEditProfile', [
            'guide' => $guide,
            'languages' => Language::all(),
            'specialities' => Speciality::all(),
        ]);
    }

    public function guide_update( Request $request){

        // dd($request);

        $guide = Auth::Guard('guides')->User();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:guides,email,'.$guide->id,
            'phone_number' => 'nullable|string|max:15',
            'about' => 'string|max:1000',
        ]);

        $guide->update($data);

        if($request->has('languages')){
            $guide->languages()->sync($request->input('languages'));
        }

        if($request->has('specialities')){
            $guide->specialities()->sync($request->input('specialities'));
        }

        return back();

    }

    public function guide_updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $guide = Auth::guard('guides')->User();

        // If user already has a photo, delete the old one
        if ($guide->profile_picture) {
            Storage::disk('public')->delete($guide->profile_picture);
        }

        // Store the new photo and get its path
        $path = $request->file('photo')->store('guide-profile-photos', 'public');

        // Update the user record with the new path
        $guide->update(['profile_picture' => $path]);

        return back()->with('success', 'Profile picture updated.');
    }
}

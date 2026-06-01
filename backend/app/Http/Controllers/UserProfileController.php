<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Language;
use Illuminate\Support\Facades\Storage;

class UserProfileController extends Controller
{
    public function view(){
        $user = Auth::user()->load('language', 'phoneCountryCode');
        return Inertia::render('Profile', [
            'user' => $user,
            'languages' => Language::all(),
        ]);
    }

    public function update(Request $request){
        $user = Auth::user()->load('language', 'phoneCountryCode');
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'phone_number' => 'nullable|string|max:15',
            'language_id' => 'nullable|exists:languages,id',
        ]);

        $user->fill($data);
        $user->save();

        return redirect()->route('Profile.view');
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        // If user already has a photo, delete the old one
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        // Store the new photo and get its path
        $path = $request->file('photo')->store('user-profile-photos', 'public');

        // Update the user record with the new path
        $user->update(['profile_photo_path' => $path]);

        return back()->with('success', 'Profile picture updated.');
    }
}

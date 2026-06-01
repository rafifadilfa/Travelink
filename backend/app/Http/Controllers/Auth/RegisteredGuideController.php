<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredGuideController extends Controller
{
    public function create(): response
    {
        return Inertia::render('auth/GuideAuth');
    }

    public function store(Request $request): RedirectResponse
    {

        $credential = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.Guide::class,
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $guide = Guide::create([
            'name' => $request->name,
            'email' => $request->email,
            'email_verified_at' => now(),
            'password' => Hash::make($request->password),
            'phone_country_code_id' => null,
            'country_id' => null,

        ]);

        event(new Registered($guide));

        Auth::guard('guides')->login($guide);

        return redirect()->intended(route('guide.dashboard'));
    }
}

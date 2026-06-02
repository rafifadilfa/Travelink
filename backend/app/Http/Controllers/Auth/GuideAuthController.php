<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Auth\LoginRequest;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Guide;

class GuideAuthController extends Controller
{

    public function create(): response
    {
        if(Auth::guard('guides')->User()){
            return redirect()->route('guide.dashboard');
        }

        return Inertia::render('auth/GuideAuth');
    }

    public function store(Request $request): RedirectResponse
    {

        $credential = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if(Auth::guard('guides')->attempt($credential)){

            $request->session()->regenerate();

            $intendedURL = session()->pull('url.intended', route('guide.dashboard'));

            if(!str_starts_with(parse_url($intendedURL, PHP_URL_PATH), '/guide')){
                return redirect()->route('guide.dashboard');
            }

            return redirect($intendedURL);
        };

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function destroy(Request $request): RedirectResponse
    {
        
        Auth::guard('guides')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}

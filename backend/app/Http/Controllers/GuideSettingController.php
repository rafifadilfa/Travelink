<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Guide;


class GuideSettingController extends Controller
{
    public function view(){
        return Inertia::render('GuideSettings');
    }
}

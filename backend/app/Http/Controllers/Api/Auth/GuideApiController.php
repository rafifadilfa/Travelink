<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password as PasswordRules;

class GuideApiController extends Controller
{
    // Register pemandu baru. Status default 'pending' dari nilai default DB.
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:guides'],
            'password' => ['required', 'confirmed', PasswordRules::defaults()],
        ]);

        try {
            $guide = Guide::create([
                'name'              => $validated['name'],
                'email'             => $validated['email'],
                'password'          => $validated['password'],
                'email_verified_at' => now(),
            ]);

            return response()->json([
                'message' => 'Pendaftaran berhasil! Akun Anda sedang menunggu verifikasi dari admin.',
                'guide'   => $guide,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat akun: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Login pemandu, kembalikan token + data guide (termasuk verification_status).
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('guides')->attempt($validated)) {
            $guide = Auth::guard('guides')->user();
            $token = $guide->createToken('guide-api-token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil!',
                'token'   => $token,
                'guide'   => $guide,
            ], 200);
        }

        return response()->json([
            'message' => 'Email atau password tidak sesuai dengan records kami.',
        ], 401);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout berhasil!',
        ], 200);
    }

    // Ambil data guide yang sedang login, termasuk verification_status terkini.
    public function getGuide(Request $request): JsonResponse
    {
        return response()->json([
            'guide' => $request->user(),
        ], 200);
    }
}

<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminApiController extends Controller
{
    /**
     * POST /api/admin/auth/login
     * Login admin — kembalikan token + data admin.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::guard('admins')->attempt($validated)) {
            $admin = Auth::guard('admins')->user();
            $token = $admin->createToken('admin-api-token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil!',
                'token'   => $token,
                'admin'   => $admin,
            ], 200);
        }

        return response()->json([
            'message' => 'Email atau password tidak sesuai.',
        ], 401);
    }

    /**
     * POST /api/admin/auth/logout
     * Revoke semua token aktif admin.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logout berhasil!'], 200);
    }

    /**
     * GET /api/admin/auth/admin
     * Kembalikan data admin yang sedang login.
     */
    public function getAdmin(Request $request): JsonResponse
    {
        return response()->json(['admin' => $request->user()], 200);
    }
}

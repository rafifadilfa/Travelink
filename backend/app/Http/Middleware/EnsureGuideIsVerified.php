<?php

namespace App\Http\Middleware;

use App\Models\Guide;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGuideIsVerified
{
    /**
     * Middleware ini dijalankan SETELAH auth:sanctum.
     * Tugasnya: pastikan tokenable-nya adalah Guide DAN statusnya sudah 'verified'.
     * Kalau belum, tolak request dengan 403 beserta pesan yang jelas untuk ditampilkan di frontend.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Pastikan yang request adalah Guide (bukan Tourist/User)
        if (!$user instanceof Guide) {
            return response()->json([
                'message' => 'Akses ditolak. Endpoint ini hanya untuk pemandu wisata.',
            ], 403);
        }

        if ($user->verification_status !== 'verified') {
            $statusMessages = [
                'pending'  => 'Akun Anda sedang menunggu verifikasi dari admin. Anda belum dapat mengelola paket tour.',
                'rejected' => 'Verifikasi akun Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
            ];

            return response()->json([
                'message'             => $statusMessages[$user->verification_status] ?? 'Akun Anda belum diverifikasi.',
                'verification_status' => $user->verification_status,
            ], 403);
        }

        return $next($request);
    }
}

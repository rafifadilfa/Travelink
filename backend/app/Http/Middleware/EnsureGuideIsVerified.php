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
     * Logika pengecekan tidak diubah — hanya gunakan konstanta Guide sebagai sumber kebenaran.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user instanceof Guide) {
            return response()->json([
                'message' => 'Akses ditolak. Endpoint ini hanya untuk pemandu wisata.',
            ], 403);
        }

        if ($user->verification_status !== Guide::STATUS_VERIFIED) {
            $statusMessages = [
                Guide::STATUS_PENDING             => 'Akun Anda belum diverifikasi. Lengkapi profil dan dokumen KYC terlebih dahulu.',
                Guide::STATUS_MENUNGGU_VERIFIKASI => 'Dokumen Anda sedang dalam peninjauan oleh admin. Mohon tunggu.',
                Guide::STATUS_REJECTED            => 'Verifikasi akun Anda ditolak. Silakan periksa catatan penolakan dan unggah ulang dokumen.',
            ];

            return response()->json([
                'message'             => $statusMessages[$user->verification_status] ?? 'Akun Anda belum diverifikasi.',
                'verification_status' => $user->verification_status,
            ], 403);
        }

        return $next($request);
    }
}

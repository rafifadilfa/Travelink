<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminKycApiController extends Controller
{
    // GET /api/admin/kyc — antrian guide menunggu_verifikasi
    public function index(): JsonResponse
    {
        $guides = Guide::where('verification_status', 'menunggu_verifikasi')
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'email', 'created_at', 'ktp_document', 'certificate_document']);

        return response()->json(['guides' => $guides], 200);
    }

    // GET /api/admin/kyc/{id} — profil lengkap + URL dokumen KYC
    public function show(int $id): JsonResponse
    {
        $guide = Guide::with(['languages', 'specialities'])
            ->findOrFail($id);

        $host = request()->getSchemeAndHttpHost();
        $url  = fn($path) => $path ? $host . '/storage/' . $path : null;

        return response()->json([
            'guide' => array_merge($guide->toArray(), [
                'languages'        => $guide->languages->pluck('name'),
                'specialities'     => $guide->specialities->pluck('name'),
                'ktp_url'          => $url($guide->ktp_document),
                'selfie_ktp_url'   => $url($guide->selfie_ktp_document),
                'certificate_url'  => $url($guide->certificate_document),
                'portfolio_url'    => $url($guide->portfolio_document),
            ]),
        ], 200);
    }

    // GET /api/admin/guides — semua guide semua status
    public function allGuides(): JsonResponse
    {
        $guides = Guide::orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'verification_status', 'created_at']);

        return response()->json(['guides' => $guides], 200);
    }

    // POST /api/admin/kyc/{id}/approve — setujui KYC, status → verified
    public function approve(int $id): JsonResponse
    {
        $guide = Guide::findOrFail($id);

        if ($guide->verification_status !== 'menunggu_verifikasi') {
            return response()->json([
                'message' => 'Guide ini tidak sedang menunggu verifikasi.',
            ], 422);
        }

        $guide->update([
            'verification_status' => 'verified',
            'rejection_reason'    => null,
        ]);

        // Notifikasi pemandu: KYC disetujui
        NotificationService::send(
            'kyc_approved',
            'guide',
            $guide->id,
            'Verifikasi Disetujui',
            'Selamat! Akun Anda telah terverifikasi. Anda sekarang dapat menggunakan semua fitur pemandu wisata.',
            ['guide_id' => $guide->id]
        );

        return response()->json([
            'message' => "Guide {$guide->name} berhasil diverifikasi.",
            'guide'   => $guide,
        ], 200);
    }

    // GET /api/admin/users — daftar semua wisatawan
    public function usersList(): JsonResponse
    {
        $users = \App\Models\User::orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'phone_number', 'created_at']);

        return response()->json(['users' => $users], 200);
    }

    // POST /api/admin/kyc/{id}/reject — tolak KYC, simpan alasan penolakan
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $guide = Guide::findOrFail($id);

        if ($guide->verification_status !== 'menunggu_verifikasi') {
            return response()->json([
                'message' => 'Guide ini tidak sedang menunggu verifikasi.',
            ], 422);
        }

        $guide->update([
            'verification_status' => 'rejected',
            'rejection_reason'    => $validated['rejection_reason'],
        ]);

        // TC-017/048: notifikasi pemandu — KYC ditolak
        NotificationService::send(
            'kyc_rejected',
            'guide',
            $guide->id,
            'Verifikasi Ditolak',
            "Verifikasi akun Anda ditolak. Alasan: {$validated['rejection_reason']}",
            ['guide_id' => $guide->id]
        );

        return response()->json([
            'message' => "Verifikasi guide {$guide->name} ditolak.",
            'guide'   => $guide,
        ], 200);
    }
}

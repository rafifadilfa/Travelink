<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminKycApiController extends Controller
{
    /**
     * GET /api/admin/kyc
     * Daftar guide dengan status 'menunggu_verifikasi' — sudah submit dokumen, siap ditinjau.
     */
    public function index(): JsonResponse
    {
        $guides = Guide::where('verification_status', Guide::STATUS_MENUNGGU_VERIFIKASI)
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'email', 'created_at', 'ktp_document', 'selfie_ktp_document', 'certificate_document']);

        return response()->json(['guides' => $guides], 200);
    }

    /**
     * GET /api/admin/kyc/{id}
     * Detail satu guide: profil lengkap + URL dokumen KYC untuk preview.
     */
    public function show(int $id): JsonResponse
    {
        $guide = Guide::with(['languages', 'specialities'])
            ->findOrFail($id);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'guide' => array_merge($guide->toArray(), [
                'languages'       => $guide->languages->pluck('name'),
                'specialities'    => $guide->specialities->pluck('name'),
                'ktp_url'         => $guide->ktp_document
                    ? $host . '/storage/' . $guide->ktp_document : null,
                'selfie_ktp_url'  => $guide->selfie_ktp_document
                    ? $host . '/storage/' . $guide->selfie_ktp_document : null,
                'certificate_url' => $guide->certificate_document
                    ? $host . '/storage/' . $guide->certificate_document : null,
                'portfolio_url'   => $guide->portfolio_document
                    ? $host . '/storage/' . $guide->portfolio_document : null,
            ]),
        ], 200);
    }

    /**
     * GET /api/admin/guides
     * Daftar SEMUA guide — semua status.
     */
    public function allGuides(): JsonResponse
    {
        $guides = Guide::orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'verification_status', 'created_at']);

        return response()->json(['guides' => $guides], 200);
    }

    /**
     * POST /api/admin/kyc/{id}/approve
     * Setujui guide: ubah verification_status → verified, hapus rejection_reason lama.
     */
    public function approve(int $id): JsonResponse
    {
        $guide = Guide::findOrFail($id);

        $guide->update([
            'verification_status' => Guide::STATUS_VERIFIED,
            'rejection_reason'    => null,
        ]);

        return response()->json([
            'message' => "Guide {$guide->name} berhasil diverifikasi.",
            'guide'   => $guide,
        ], 200);
    }

    /**
     * POST /api/admin/kyc/{id}/reject
     * Tolak guide: ubah verification_status → rejected, simpan alasan penolakan.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $guide = Guide::findOrFail($id);

        $guide->update([
            'verification_status' => Guide::STATUS_REJECTED,
            'rejection_reason'    => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => "Verifikasi guide {$guide->name} ditolak.",
            'guide'   => $guide,
        ], 200);
    }
}

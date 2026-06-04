<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Guide;
use App\Models\Language;
use App\Models\Speciality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuideProfileApiController extends Controller
{
    // ================================================================
    // GET /api/guide/profile
    // Kembalikan profil lengkap + completeness 2 tahap + URL dokumen
    // UC-12 (indikator progres), UC-13 (semua field profil)
    // ================================================================
    public function getProfile(Request $request): JsonResponse
    {
        $guide = $request->user()->load(['languages', 'specialities']);

        $completeness = $this->buildCompleteness($guide);
        $host         = request()->getSchemeAndHttpHost();

        return response()->json([
            'guide' => array_merge($guide->toArray(), [
                'languages'              => $guide->languages->pluck('name'),
                'specialities'           => $guide->specialities->pluck('name'),
                'avatar_url'             => $guide->profile_picture
                    ? $host . '/storage/' . $guide->profile_picture : null,
                'ktp_url'                => $guide->ktp_document
                    ? $host . '/storage/' . $guide->ktp_document : null,
                'selfie_ktp_url'         => $guide->selfie_ktp_document
                    ? $host . '/storage/' . $guide->selfie_ktp_document : null,
                'certificate_url'        => $guide->certificate_document
                    ? $host . '/storage/' . $guide->certificate_document : null,
                'portfolio_url'          => $guide->portfolio_document
                    ? $host . '/storage/' . $guide->portfolio_document : null,
                'completeness'           => $completeness,
                'step1_complete'         => $completeness['step1_complete'],
                'step2_complete'         => $completeness['step2_complete'],
                'is_profile_complete'    => $completeness['step1_complete'] && $completeness['step2_complete'],
                'can_submit_kyc'         => $this->canSubmitKyc($guide),
            ]),
        ], 200);
    }

    // ================================================================
    // POST /api/guide/profile
    // Update info dasar (Tahap 1): nama, bio, foto, bahasa, spesialisasi,
    // pengalaman, tarif dasar, rekening bank (UC-13)
    // ================================================================
    public function updateProfile(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:100'],
            'about'                => ['sometimes', 'string', 'max:500'],
            'experience_years'     => ['sometimes', 'integer', 'min:0'],
            'base_rate'            => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'profile_picture'      => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'languages'            => ['sometimes', 'array'],
            'languages.*'          => ['string', 'max:100'],
            'specialities'         => ['sometimes', 'array'],
            'specialities.*'       => ['string', 'max:100'],
            // Rekening bank (UC-13)
            'bank_name'            => ['sometimes', 'nullable', 'string', 'max:100'],
            'bank_account_number'  => ['sometimes', 'nullable', 'string', 'max:50'],
            'bank_account_holder'  => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        // Upload foto profil kalau ada
        if ($request->hasFile('profile_picture')) {
            if ($guide->profile_picture) {
                Storage::disk('public')->delete($guide->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')
                ->store('guides/photos', 'public');
        }

        // Update field skalar
        $scalarFields = ['name', 'about', 'experience_years', 'base_rate', 'profile_picture',
                         'bank_name', 'bank_account_number', 'bank_account_holder'];
        $guide->update(array_intersect_key($validated, array_flip($scalarFields)));

        // Sync bahasa
        if (isset($validated['languages'])) {
            $ids = collect($validated['languages'])
                ->filter()
                ->map(fn($name) => Language::firstOrCreate(['name' => trim($name)])->id);
            $guide->languages()->sync($ids);
        }

        // Sync spesialisasi
        if (isset($validated['specialities'])) {
            $ids = collect($validated['specialities'])
                ->filter()
                ->map(fn($name) => Speciality::firstOrCreate(['name' => trim($name)])->id);
            $guide->specialities()->sync($ids);
        }

        return $this->getProfile($request);
    }

    // ================================================================
    // POST /api/guide/profile/ktp
    // Upload dokumen KTP (UC-12 Tahap 2)
    // ================================================================
    public function uploadKtp(Request $request): JsonResponse
    {
        $request->validate([
            'ktp_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $guide = $request->user();

        if ($guide->ktp_document) {
            Storage::disk('public')->delete($guide->ktp_document);
        }

        $path = $request->file('ktp_document')->store('kyc', 'public');
        $guide->update(['ktp_document' => $path]);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'message' => 'KTP berhasil diupload.',
            'ktp_url' => $host . '/storage/' . $path,
        ], 200);
    }

    // ================================================================
    // POST /api/guide/profile/selfie-ktp
    // Upload foto selfie bersama KTP (UC-12 Tahap 2 — wajib)
    // ================================================================
    public function uploadSelfieKtp(Request $request): JsonResponse
    {
        $request->validate([
            'selfie_ktp_document' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $guide = $request->user();

        if ($guide->selfie_ktp_document) {
            Storage::disk('public')->delete($guide->selfie_ktp_document);
        }

        $path = $request->file('selfie_ktp_document')->store('kyc', 'public');
        $guide->update(['selfie_ktp_document' => $path]);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'message'        => 'Foto selfie bersama KTP berhasil diupload.',
            'selfie_ktp_url' => $host . '/storage/' . $path,
        ], 200);
    }

    // ================================================================
    // POST /api/guide/profile/certificate
    // Upload sertifikat profesi pemandu (UC-12 Tahap 2 — opsional)
    // ================================================================
    public function uploadCertificate(Request $request): JsonResponse
    {
        $request->validate([
            'certificate_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $guide = $request->user();

        if ($guide->certificate_document) {
            Storage::disk('public')->delete($guide->certificate_document);
        }

        $path = $request->file('certificate_document')->store('kyc', 'public');
        $guide->update(['certificate_document' => $path]);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'message'         => 'Sertifikat berhasil diupload.',
            'certificate_url' => $host . '/storage/' . $path,
        ], 200);
    }

    // ================================================================
    // POST /api/guide/profile/portfolio
    // Upload portofolio trip (UC-12 Tahap 2 — opsional)
    // ================================================================
    public function uploadPortfolio(Request $request): JsonResponse
    {
        $request->validate([
            'portfolio_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $guide = $request->user();

        if ($guide->portfolio_document) {
            Storage::disk('public')->delete($guide->portfolio_document);
        }

        $path = $request->file('portfolio_document')->store('kyc', 'public');
        $guide->update(['portfolio_document' => $path]);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'message'       => 'Portofolio berhasil diupload.',
            'portfolio_url' => $host . '/storage/' . $path,
        ], 200);
    }

    // ================================================================
    // POST /api/guide/profile/submit
    // Kirim dokumen untuk diverifikasi admin (UC-12 tombol "Kirim untuk Diverifikasi")
    // Validasi: KTP dan selfie KTP wajib ada (A3)
    // pending | rejected → menunggu_verifikasi
    // ================================================================
    public function submitForVerification(Request $request): JsonResponse
    {
        $guide = $request->user();

        // Hanya boleh submit jika status pending atau rejected (bukan menunggu/verified)
        $allowedStatuses = [Guide::STATUS_PENDING, Guide::STATUS_REJECTED];
        if (!in_array($guide->verification_status, $allowedStatuses)) {
            return response()->json([
                'message' => 'Dokumen sudah dalam proses verifikasi atau akun sudah terverifikasi.',
            ], 422);
        }

        // A3: KTP dan selfie wajib ada sebelum submit
        if (!$this->canSubmitKyc($guide)) {
            return response()->json([
                'message' => 'Foto KTP dan selfie bersama KTP wajib diunggah sebelum mengajukan verifikasi.',
                'missing' => [
                    'ktp_document'        => empty($guide->ktp_document),
                    'selfie_ktp_document' => empty($guide->selfie_ktp_document),
                ],
            ], 422);
        }

        $guide->update(['verification_status' => Guide::STATUS_MENUNGGU_VERIFIKASI]);

        // TODO: notifikasi admin (out of scope)

        return response()->json([
            'message'            => 'Dokumen berhasil dikirim untuk diverifikasi. Mohon tunggu proses peninjauan dari admin.',
            'verification_status' => $guide->verification_status,
        ], 200);
    }

    // ----------------------------------------------------------------
    // Helper: apakah guide bisa submit KYC?
    // Minimal: KTP dan selfie KTP harus ada
    // ----------------------------------------------------------------
    private function canSubmitKyc(Guide $guide): bool
    {
        return !empty($guide->ktp_document) && !empty($guide->selfie_ktp_document);
    }

    // ----------------------------------------------------------------
    // Helper: hitung completeness 2 tahap untuk indikator progres UC-12
    // ----------------------------------------------------------------
    private function buildCompleteness(Guide $guide): array
    {
        // Tahap 1 — Profil Profesional (S-1)
        $step1 = [
            'profile_picture'  => !empty($guide->profile_picture),
            'about'            => !empty($guide->about),
            'languages'        => $guide->languages->count() > 0,
            'specialities'     => $guide->specialities->count() > 0,
            'experience_years' => ($guide->experience_years ?? 0) > 0,
        ];

        // Tahap 2 — Dokumen KYC (S-2)
        $step2 = [
            'ktp_document'        => !empty($guide->ktp_document),
            'selfie_ktp_document' => !empty($guide->selfie_ktp_document), // wajib
            'certificate_document' => !empty($guide->certificate_document), // opsional
            'portfolio_document'   => !empty($guide->portfolio_document),   // opsional
        ];

        return [
            'step1'          => $step1,
            'step1_complete' => !in_array(false, $step1, true),
            'step2'          => $step2,
            // step2 dianggap lengkap minimal jika KTP + selfie ada (certificate opsional)
            'step2_complete' => $step2['ktp_document'] && $step2['selfie_ktp_document'],
        ];
    }
}

<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Language;
use App\Models\Speciality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuideProfileApiController extends Controller
{
    /**
     * GET /api/guide/profile
     * Kembalikan profil lengkap guide + bahasa + spesialisasi + status dokumen KYC
     * + objek completeness (6 kriteria) + flag is_profile_complete.
     */
    public function getProfile(Request $request): JsonResponse
    {
        $guide = $request->user()->load(['languages', 'specialities']);

        $completeness = $this->buildCompleteness($guide);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'guide' => array_merge($guide->toArray(), [
                'languages'           => $guide->languages->pluck('name'),
                'specialities'        => $guide->specialities->pluck('name'),
                'ktp_url'             => $guide->ktp_document
                    ? $host . Storage::disk('public')->url($guide->ktp_document) : null,
                'certificate_url'     => $guide->certificate_document
                    ? $host . Storage::disk('public')->url($guide->certificate_document) : null,
                'completeness'        => $completeness,
                'is_profile_complete' => !in_array(false, $completeness, true),
            ]),
        ], 200);
    }

    /**
     * POST /api/guide/profile
     * Update info dasar: nama, tentang saya, foto profil, bahasa, spesialisasi.
     * Dikirim sebagai multipart/form-data karena bisa ada upload foto.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'name'           => ['sometimes', 'string', 'max:100'],
            'about'          => ['sometimes', 'string', 'max:500'],
            'profile_picture' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'languages'      => ['sometimes', 'array'],
            'languages.*'    => ['string', 'max:100'],
            'specialities'   => ['sometimes', 'array'],
            'specialities.*' => ['string', 'max:100'],
        ]);

        // Upload foto profil kalau ada
        if ($request->hasFile('profile_picture')) {
            // Hapus foto lama kalau ada
            if ($guide->profile_picture) {
                Storage::disk('public')->delete($guide->profile_picture);
            }
            $path = $request->file('profile_picture')
                ->store('guides/photos', 'public');
            $validated['profile_picture'] = $path;
        }

        // Update field teks
        $guide->update(array_filter(
            $validated,
            fn($key) => in_array($key, ['name', 'about', 'profile_picture']),
            ARRAY_FILTER_USE_KEY
        ));

        // Sync bahasa — cari atau buat record Language, lalu sync pivot
        if (isset($validated['languages'])) {
            $languageIds = collect($validated['languages'])
                ->filter()
                ->map(fn($name) => Language::firstOrCreate(['name' => trim($name)])->id);
            $guide->languages()->sync($languageIds);
        }

        // Sync spesialisasi — cari atau buat record Speciality, lalu sync pivot
        if (isset($validated['specialities'])) {
            $specialityIds = collect($validated['specialities'])
                ->filter()
                ->map(fn($name) => Speciality::firstOrCreate(['name' => trim($name)])->id);
            $guide->specialities()->sync($specialityIds);
        }

        return $this->getProfile($request);
    }

    /**
     * POST /api/guide/profile/ktp
     * Upload dokumen KTP. Validasi tipe & ukuran file.
     */
    public function uploadKtp(Request $request): JsonResponse
    {
        $request->validate([
            'ktp_document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ]);

        $guide = $request->user();

        // Hapus file lama kalau ada
        if ($guide->ktp_document) {
            Storage::disk('public')->delete($guide->ktp_document);
        }

        $path = $request->file('ktp_document')->store('kyc', 'public');
        $guide->update(['ktp_document' => $path]);

        $host = request()->getSchemeAndHttpHost();

        return response()->json([
            'message' => 'KTP berhasil diupload.',
            'ktp_url' => $host . Storage::disk('public')->url($path),
        ], 200);
    }

    /**
     * POST /api/guide/profile/certificate
     * Upload sertifikat pemandu wisata. Validasi tipe & ukuran file.
     */
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
            'certificate_url' => $host . Storage::disk('public')->url($path),
        ], 200);
    }

    /**
     * Helper: hitung 6 kriteria kelengkapan profil.
     * Dipanggil oleh getProfile() dan updateProfile().
     */
    private function buildCompleteness($guide): array
    {
        return [
            'profile_picture'      => !empty($guide->profile_picture),
            'about'                => !empty($guide->about),
            'languages'            => $guide->languages->count() > 0,
            'specialities'         => $guide->specialities->count() > 0,
            'ktp_document'         => !empty($guide->ktp_document),
            'certificate_document' => !empty($guide->certificate_document),
        ];
    }
}

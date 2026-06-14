<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Guide;
use App\Models\Language;
use App\Models\Speciality;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuideProfileApiController extends Controller
{
    // GET /api/guide/profile — profil lengkap dengan status KYC, completeness flat + nested
    public function getProfile(Request $request): JsonResponse
    {
        $guide = $request->user()->load(['languages', 'specialities']);

        $host = request()->getSchemeAndHttpHost();

        $url = fn($path) => $path ? $host . '/storage/' . $path : null;

        $completeness = $this->buildCompleteness($guide);

        return response()->json([
            'guide' => array_merge($guide->toArray(), [
                'languages'          => $guide->languages->pluck('name'),
                'specialities'       => $guide->specialities->pluck('name'),
                'avatar_url'         => $url($guide->profile_picture),
                'ktp_url'            => $url($guide->ktp_document),
                'selfie_ktp_url'     => $url($guide->selfie_ktp_document),
                'certificate_url'    => $url($guide->certificate_document),
                'portfolio_url'      => $url($guide->portfolio_document),
                // completeness: flat untuk GuideDashboard, nested untuk GuideEditProfile
                'completeness'       => $completeness,
                'is_profile_complete' => $completeness['step1_complete'] && $completeness['step2']['ktp_document'] && $completeness['step2']['selfie_ktp_document'] && $completeness['step2']['portfolio_document'],
                'step1_complete'     => $completeness['step1_complete'],
                'step2_complete'     => $completeness['step2_complete'],
                'can_submit_kyc'     => !empty($guide->ktp_document) && !empty($guide->selfie_ktp_document) && !empty($guide->portfolio_document),
            ]),
        ], 200);
    }

    // POST /api/guide/profile — update info dasar, foto, rekening, bahasa, spesialisasi
    public function updateProfile(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'name'                => ['sometimes', 'string', 'max:100'],
            'about'               => ['sometimes', 'string', 'max:500'],
            'experience_years'    => ['sometimes', 'integer', 'min:0', 'max:50'],
            'base_rate'           => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'bank_name'           => ['sometimes', 'nullable', 'string', 'max:100'],
            'bank_account_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'bank_account_holder' => ['sometimes', 'nullable', 'string', 'max:100'],
            'profile_picture'     => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'languages'           => ['sometimes', 'array'],
            'languages.*'         => ['string', 'max:100'],
            'specialities'        => ['sometimes', 'array'],
            'specialities.*'      => ['string', 'max:100'],
        ]);

        if ($request->hasFile('profile_picture')) {
            if ($guide->profile_picture) {
                Storage::disk('public')->delete($guide->profile_picture);
            }
            $validated['profile_picture'] = $request->file('profile_picture')
                ->store('guides/photos', 'public');
        }

        $scalarFields = ['name', 'about', 'experience_years', 'base_rate',
                         'bank_name', 'bank_account_number', 'bank_account_holder',
                         'profile_picture'];
        $guide->update(array_filter(
            $validated,
            fn($key) => in_array($key, $scalarFields),
            ARRAY_FILTER_USE_KEY
        ));

        if (isset($validated['languages'])) {
            $languageIds = collect($validated['languages'])
                ->filter()
                ->map(fn($name) => Language::firstOrCreate(['name' => trim($name)])->id);
            $guide->languages()->sync($languageIds);
        }

        if (isset($validated['specialities'])) {
            $specialityIds = collect($validated['specialities'])
                ->filter()
                ->map(fn($name) => Speciality::firstOrCreate(['name' => trim($name)])->id);
            $guide->specialities()->sync($specialityIds);
        }

        return $this->getProfile($request);
    }

    // POST /api/guide/profile/ktp — upload dokumen KTP
    public function uploadKtp(Request $request): JsonResponse
    {
        $request->validate([
            'ktp_document' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:2048'],
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

    // POST /api/guide/profile/selfie-ktp — upload selfie bersama KTP
    public function uploadSelfieKtp(Request $request): JsonResponse
    {
        $request->validate([
            'selfie_ktp_document' => ['required', 'file', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $guide = $request->user();
        if ($guide->selfie_ktp_document) {
            Storage::disk('public')->delete($guide->selfie_ktp_document);
        }
        $path = $request->file('selfie_ktp_document')->store('kyc', 'public');
        $guide->update(['selfie_ktp_document' => $path]);

        $host = request()->getSchemeAndHttpHost();
        return response()->json([
            'message'         => 'Selfie KTP berhasil diupload.',
            'selfie_ktp_url'  => $host . '/storage/' . $path,
        ], 200);
    }

    // POST /api/guide/profile/certificate — upload sertifikat pemandu
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

    // POST /api/guide/profile/portfolio — upload portofolio trip (opsional)
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
            'message'         => 'Portofolio berhasil diupload.',
            'portfolio_url'   => $host . '/storage/' . $path,
        ], 200);
    }

    // POST /api/guide/profile/submit — ubah status ke menunggu_verifikasi, notifikasi admin
    public function submitKyc(Request $request): JsonResponse
    {
        $guide = $request->user();

        if (empty($guide->ktp_document) || empty($guide->selfie_ktp_document) || empty($guide->portfolio_document)) {
            return response()->json([
                'message' => 'KTP, selfie bersama KTP, dan portofolio trip wajib diupload sebelum mengirim untuk verifikasi.',
            ], 422);
        }

        $guide->update(['verification_status' => 'menunggu_verifikasi']);

        // Notifikasi semua admin: ada pengajuan KYC baru
        Admin::all()->each(function (Admin $admin) use ($guide) {
            NotificationService::send(
                'kyc_submitted',
                'admin',
                $admin->id,
                'KYC Baru Menunggu Verifikasi',
                "Pemandu \"{$guide->name}\" telah mengajukan dokumen KYC. Silakan tinjau dan verifikasi.",
                ['guide_id' => $guide->id]
            );
        });

        return response()->json([
            'message' => 'Dokumen berhasil dikirim. Admin akan meninjau dalam 1-3 hari kerja.',
        ], 200);
    }

    // Bangun completeness untuk GuideDashboard (flat) dan GuideEditProfile (nested step1/step2)
    private function buildCompleteness(Guide $guide): array
    {
        $step1 = [
            'profile_picture'  => !empty($guide->profile_picture),
            'about'            => !empty($guide->about),
            'languages'        => $guide->languages->count() > 0,
            'specialities'     => $guide->specialities->count() > 0,
            'experience_years' => ($guide->experience_years ?? 0) > 0,
            'base_rate'        => !is_null($guide->base_rate) && $guide->base_rate > 0,
        ];

        $step2 = [
            'ktp_document'         => !empty($guide->ktp_document),
            'selfie_ktp_document'  => !empty($guide->selfie_ktp_document),
            'certificate_document' => !empty($guide->certificate_document),
            'portfolio_document'   => !empty($guide->portfolio_document),
        ];

        $step1Complete = !in_array(false, $step1, true);
        // Step 2 selesai jika KTP + selfie + portofolio ada (sertifikat opsional)
        $step2Complete = $step2['ktp_document'] && $step2['selfie_ktp_document'] && $step2['portfolio_document'];

        // flat fields dipertahankan agar GuideDashboard tetap bisa baca
        return array_merge(
            [
                'profile_picture'      => $step1['profile_picture'],
                'about'                => $step1['about'],
                'languages'            => $step1['languages'],
                'specialities'         => $step1['specialities'],
                'experience_years'     => $step1['experience_years'],
                'base_rate'            => $step1['base_rate'],
                'ktp_document'         => $step2['ktp_document'],
                'selfie_ktp_document'  => $step2['selfie_ktp_document'],
                'certificate_document' => $step2['certificate_document'],
                'portfolio_document'   => $step2['portfolio_document'],
            ],
            [
                'step1'          => $step1,
                'step1_complete' => $step1Complete,
                'step2'          => $step2,
                'step2_complete' => $step2Complete,
            ]
        );
    }
}

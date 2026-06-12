<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserProfileApiController extends Controller
{
    // GET /api/user/profile
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->formatUser($user, $request),
        ]);
    }

    // PUT /api/user/profile
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone_number'     => ['nullable', 'string', 'max:20'],
            'ot_age'           => ['nullable', 'integer', 'min:1', 'max:120'],
            'ot_budget_level'  => ['nullable', 'integer', 'min:1', 'max:5'],
            'ot_interests'     => ['nullable', 'array'],
            'ot_interests.*'   => ['integer'],
        ]);

        $user->update([
            'name'            => $validated['name'],
            'email'           => $validated['email'],
            'phone_number'    => $validated['phone_number'] ?? $user->phone_number,
            'ot_age'          => $validated['ot_age']          ?? $user->ot_age,
            'ot_budget_level' => $validated['ot_budget_level'] ?? $user->ot_budget_level,
            'ot_interests'    => isset($validated['ot_interests'])
                ? json_encode($validated['ot_interests'])
                : $user->ot_interests,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $this->formatUser($user->fresh(), $request),
        ]);
    }

    // POST /api/user/profile/photo
    // TC-013: Upload foto profil wisatawan.
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('photo')->store('users/photos', 'public');
        $user->update(['profile_photo_path' => $path]);

        $host = $request->getSchemeAndHttpHost();

        return response()->json([
            'message'   => 'Foto profil berhasil diperbarui.',
            'photo_url' => $host . '/storage/' . $path,
        ]);
    }

    private function formatUser($user, ?Request $request = null): array
    {
        $host = $request?->getSchemeAndHttpHost() ?? '';

        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'phone_number'    => $user->phone_number ?? '',
            'profile_picture' => $user->profile_photo_path
                ? ($host . '/storage/' . $user->profile_photo_path)
                : null,
            'joined_date'     => $user->created_at->format('F Y'),
            'bookings_count'  => $user->bookings()->count(),
            'reviews_count'   => ($user->review_count_guide ?? 0),
            'ot_age'          => $user->ot_age,
            'ot_budget_level' => $user->ot_budget_level,
            'ot_interests'    => $user->ot_interests
                ? json_decode($user->ot_interests, true)
                : [],
        ];
    }
}

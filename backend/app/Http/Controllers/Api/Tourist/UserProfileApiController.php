<?php

namespace App\Http\Controllers\Api\Tourist;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserProfileApiController extends Controller
{
    // GET /api/user/profile
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    // PUT /api/user/profile
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'unique:users,email,' . $user->id],
            'phone_number' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    private function formatUser($user): array
    {
        return [
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'phone_number'    => $user->phone_number ?? '',
            'profile_picture' => $user->profile_photo_path,
            'joined_date'     => $user->created_at->format('F Y'),
            'bookings_count'  => $user->bookings()->count(),
            'reviews_count'   => ($user->review_count_guide ?? 0) + ($user->review_count_tour ?? 0),
        ];
    }
}

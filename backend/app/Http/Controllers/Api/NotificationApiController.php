<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AppNotification;
use App\Models\Guide;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Notifikasi sistem untuk User, Guide, dan Admin.
 *
 * GET   /api/notifications             — daftar + unread count
 * PATCH /api/notifications/read-all   — tandai semua sudah dibaca
 * PATCH /api/notifications/{id}/read  — tandai satu sudah dibaca
 */
class NotificationApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        [$type, $id] = $this->resolveNotifiable($request);

        $notifications = AppNotification::where('notifiable_type', $type)
            ->where('notifiable_id', $id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'data'         => $notifications,
            'unread_count' => $notifications->where('is_read', false)->count(),
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        [$type, $userId] = $this->resolveNotifiable($request);

        $notif = AppNotification::where('notifiable_type', $type)
            ->where('notifiable_id', $userId)
            ->findOrFail($id);

        $notif->update(['is_read' => true]);

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        [$type, $id] = $this->resolveNotifiable($request);

        AppNotification::where('notifiable_type', $type)
            ->where('notifiable_id', $id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai sudah dibaca.']);
    }

    private function resolveNotifiable(Request $request): array
    {
        $user = $request->user();
        $type = match (true) {
            $user instanceof Guide => 'guide',
            $user instanceof Admin => 'admin',
            default                => 'user',
        };
        return [$type, $user->id];
    }
}

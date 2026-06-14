<?php

namespace App\Services;

use App\Models\AppNotification;

class NotificationService
{
    // Kirim notifikasi ke user/guide/admin. $notifiableType: 'user' | 'guide' | 'admin'.
    public static function send(
        string $type,
        string $notifiableType,
        int    $notifiableId,
        string $title,
        string $message,
        array  $data = []
    ): void {
        AppNotification::create([
            'notifiable_type' => $notifiableType,
            'notifiable_id'   => $notifiableId,
            'type'            => $type,
            'title'           => $title,
            'message'         => $message,
            'data'            => $data ?: null,
            'is_read'         => false,
        ]);
    }
}

<?php

namespace App\Services;

use App\Models\AppNotification;

class NotificationService
{
    /**
     * Kirim satu notifikasi ke user, guide, atau admin.
     *
     * @param string $type           Kode tipe notifikasi (mis. 'booking_accepted')
     * @param string $notifiableType 'user' | 'guide' | 'admin'
     * @param int    $notifiableId   ID penerima
     * @param string $title          Judul singkat
     * @param string $message        Pesan lengkap
     * @param array  $data           Data tambahan (opsional, disimpan sebagai JSON)
     */
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

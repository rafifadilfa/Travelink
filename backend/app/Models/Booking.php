<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';

    // ── Nilai status booking ──────────────────────────────────────────────────
    const STATUS_MENUNGGU_KONFIRMASI_PEMANDU    = 'menunggu_konfirmasi_pemandu';
    const STATUS_MENUNGGU_PEMBAYARAN            = 'menunggu_pembayaran';
    const STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN = 'menunggu_verifikasi_pembayaran';
    const STATUS_TERKONFIRMASI                  = 'terkonfirmasi'; // pembayaran verified, trip belum selesai
    const STATUS_SELESAI                        = 'selesai';
    const STATUS_DITOLAK                        = 'ditolak';
    const STATUS_DIBATALKAN                     = 'dibatalkan';
    const STATUS_DIBATALKAN_OTOMATIS            = 'dibatalkan_otomatis'; // TC-045, TC-049

    // Status yang masih "aktif" (belum terminal)
    const ACTIVE_STATUSES = [
        self::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
        self::STATUS_MENUNGGU_PEMBAYARAN,
        self::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
        self::STATUS_TERKONFIRMASI,
    ];

    // Status terminal (riwayat)
    const TERMINAL_STATUSES = [
        self::STATUS_SELESAI,
        self::STATUS_DITOLAK,
        self::STATUS_DIBATALKAN,
        self::STATUS_DIBATALKAN_OTOMATIS,
    ];

    protected $fillable = [
        'user_id',
        'transaction_id',
        'booking_status',
        'tour_reviewed',
        'guide_reviewed',
        'cancelation_reason',
        'payment_proof_path',
        'paid_at',
        'payment_verified_at',
        'payment_verified_by',
    ];

    protected $casts = [
        'tour_reviewed'        => 'boolean',
        'guide_reviewed'       => 'boolean',
        'paid_at'              => 'datetime',
        'payment_verified_at'  => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}

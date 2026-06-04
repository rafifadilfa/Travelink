<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';

    // ---------------------------------------------------------------
    // Konstanta status pesanan — satu-satunya sumber kebenaran.
    // Gunakan konstanta ini di seluruh codebase; jangan pakai string literal.
    //
    // Alur transisi:
    // menunggu_konfirmasi_pemandu
    //   → (pemandu terima) menunggu_pembayaran
    //   → (wisatawan upload bukti) menunggu_verifikasi_pembayaran
    //   → (admin verifikasi) terkonfirmasi
    //   → (A1: trip lewat) selesai
    //
    // Cabang:
    //   → (pemandu tolak) ditolak
    //   → (cancel manual) dibatalkan
    //   → (A3: timeout 24 jam) dibatalkan_otomatis
    // ---------------------------------------------------------------
    const STATUS_MENUNGGU_KONFIRMASI_PEMANDU    = 'menunggu_konfirmasi_pemandu';
    const STATUS_MENUNGGU_PEMBAYARAN            = 'menunggu_pembayaran';
    const STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN = 'menunggu_verifikasi_pembayaran';
    const STATUS_TERKONFIRMASI                  = 'terkonfirmasi';
    const STATUS_SELESAI                        = 'selesai';
    const STATUS_DITOLAK                        = 'ditolak';
    const STATUS_DIBATALKAN                     = 'dibatalkan';         // pembatalan manual
    const STATUS_DIBATALKAN_OTOMATIS            = 'dibatalkan_otomatis'; // A3: timeout 24 jam

    // Status "aktif" — dipakai filter daftar pesanan aktif (UC-21)
    const ACTIVE_STATUSES = [
        self::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
        self::STATUS_MENUNGGU_PEMBAYARAN,
        self::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
        self::STATUS_TERKONFIRMASI,
    ];

    // Status "terminal" — pesanan sudah tidak bisa berubah
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

    public function verifiedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'payment_verified_by');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'booking_id');
    }
}

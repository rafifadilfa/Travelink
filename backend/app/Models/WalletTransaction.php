<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Riwayat mutasi saldo dompet pemandu (UC-22).
// Setiap baris adalah satu mutasi: pemasukan (credit) atau pencairan (debit).
class WalletTransaction extends Model
{
    protected $table = 'wallet_transactions';

    // Tipe transaksi
    const TYPE_INCOME     = 'income';      // pemasukan dari pesanan selesai
    const TYPE_WITHDRAWAL = 'withdrawal';  // pencairan dana

    // Arah mutasi
    const DIRECTION_CREDIT = 'credit'; // saldo bertambah
    const DIRECTION_DEBIT  = 'debit';  // saldo berkurang

    protected $fillable = [
        'guide_id',
        'type',
        'direction',
        'amount',
        'booking_id',
        'withdrawal_id',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function withdrawal()
    {
        return $this->belongsTo(Withdrawal::class, 'withdrawal_id');
    }
}

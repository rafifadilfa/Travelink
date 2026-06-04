<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Model permintaan pencairan dana pemandu (UC-17, UC-20).
class Withdrawal extends Model
{
    protected $table = 'withdrawals';

    // Konstanta status pencairan
    const STATUS_MENUNGGU_VERIFIKASI = 'menunggu_verifikasi';
    const STATUS_SELESAI             = 'selesai';
    const STATUS_DITOLAK             = 'ditolak';

    protected $fillable = [
        'guide_id',
        'amount',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'status',
        'rejection_reason',
        'processed_by',
        'processed_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id');
    }

    public function processedByAdmin()
    {
        return $this->belongsTo(Admin::class, 'processed_by');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'withdrawal_id');
    }
}

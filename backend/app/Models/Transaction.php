<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Booking;

class Transaction extends Model
{

    protected $table = 'transactions';

    protected $fillable = [
        'user_id',
        'guide_id',
        'tour_id',
        'participant_count',
        'price_per_participant',
        'tour_date',
        'payment_method_id',
        'payment_status',
        'total_amount',
        'transaction_code',
        'midtrans_order_id',
    ];

    protected static function booted(): void
    {
        // Auto-generate transaction_code: INV-YYYYMMDD-XXXX (urutan per hari)
        static::creating(function (Transaction $transaction) {
            $date        = now()->format('Ymd');
            $latestToday = Transaction::whereDate('created_at', today())->latest('id')->first();
            $nextNumber  = $latestToday ? ((int) substr($latestToday->transaction_code, -4)) + 1 : 1;
            $transaction->transaction_code = 'INV-' . $date . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        });

        static::created(function (Transaction $transaction) {
            if ($transaction->user) {
                $transaction->user->increment('booking_count');
            }
            if ($transaction->tour) {
                $transaction->tour->increment('tour_booking_count');
            }
        });

        static::deleted(function (Transaction $transaction) {
            if ($transaction->user) {
                $transaction->user->decrement('booking_count');
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id');
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id')->withTrashed();
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function tourReview()
    {
        return $this->hasOne(TourReview::class, 'transaction_id');
    }

    public function guideReview()
    {
        return $this->hasOne(GuideReview::class, 'transaction_id');
    }

    public function booking()
    {
        return $this->hasOne(Booking::class, 'transaction_id');
    }
}

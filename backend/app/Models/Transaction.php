<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\booking;

class Transaction extends Model
{

    protected $table = 'transactions'; // Specify the table name if it doesn't follow Laravel's naming convention

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
        'transaction_code', // Add transaction_code here
    ];

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction) {
            // This closure will be executed when a new transaction is being created.

            // 1. Get the current date in the format YYYYMMDD (e.g., 20250625)
            $date = now()->format('Ymd');

            // 2. Find the latest transaction for today to determine the next number
            $latestToday = Transaction::whereDate('created_at', today())->latest('id')->first();
            
            // 3. Determine the next sequence number
            if ($latestToday) {
                // Get the number from the last code and increment it
                $lastNumber = (int) substr($latestToday->transaction_code, -4);
                $nextNumber = $lastNumber + 1;
            } else {
                // If it's the first transaction of the day, start from 1
                $nextNumber = 1;
            }

            // 4. Pad the number with leading zeros to make it 4 digits (e.g., 1 becomes 0001)
            $sequence = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            // 5. Combine everything and assign it to the transaction_code
            $transaction->transaction_code = 'INV-' . $date . '-' . $sequence;
        });

        static::created(function (Transaction $transaction) {
            // Check if there is a user associated with this transaction
            if ($transaction->user) {
                // Use Laravel's built-in increment method.
                // It's atomic and more efficient than fetching, adding, and saving.
                $transaction->user->increment('booking_count');
            }

            if ($transaction->tour){
                $transaction->tour->increment('tour_booking_count');
            }

        });

        static::deleted(function (Transaction $transaction) {
            // Check if there is a user associated with this transaction
            if ($transaction->user) {
                // Use Laravel's built-in decrement method.
                // It's atomic and more efficient than fetching, subtracting, and saving.
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

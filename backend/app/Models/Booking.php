<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    
    protected $table = 'bookings';

    protected $fillable = [
        'user_id',
        'transaction_id',
        'booking_status',
        'tour_reviewed',
        'guide_reviewed',
        'cancelation_reason',
    ];
    
    // Define the relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Define the relationship with the Transaction model
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    protected $casts = [
        'tour_reviewed' => 'boolean',
        'guide_reviewed' => 'boolean',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideReview extends Model
{
    protected $table = 'guide_reviews';

    protected $fillable = [
        'user_id',
        'guide_id',
        'transaction_id',
        'participant_id',
        'rating',
        'comment',
    ];

    protected static function booted(): void
    {
        static::created(function (GuideReview $guidereview) {
            // Recalculate rata-rata rating guide setiap ada ulasan baru
            $guide = $guidereview->guide;
            if ($guide) {
                $avg = GuideReview::where('guide_id', $guide->id)->avg('rating');
                $guide->update(['rating' => round((float) $avg, 2)]);
            }
        });
    }

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function participant()
    {
        return $this->belongsTo(OpenTripParticipant::class, 'participant_id');
    }
}

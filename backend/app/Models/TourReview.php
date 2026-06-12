<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourReview extends Model
{
    protected static function booted(): void
    {
        static::created(function (TourReview $tourreview) {
            // Recalculate rata-rata rating tour setiap ada ulasan baru
            $tour = $tourreview->tour;
            if ($tour) {
                $avg = TourReview::where('tour_id', $tour->id)->avg('rating');
                $tour->update(['tour_rating' => round((float) $avg, 2)]);
            }
            // Update review_count_tour pada user
            $tourreview->user?->increment('review_count_tour');
        });
    }


    protected $table = 'tour_reviews'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'transaction_id',
        'tour_id',
        'user_id', // assuming there is a user_id to identify the reviewer
        'rating',
        'review',
        'comment',
    ]; // specify the fillable attributes for mass assignment

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id'); // every review belongs to one tour
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id'); // every review is associated with one transaction
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

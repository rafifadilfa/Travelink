<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuideReview extends Model
{

    protected static function booted(): void
    {
        static::created(function (GuideReview $guidereview) {
            // Check if there is a user associated with this transaction
            if ($guidereview->user && $guidereview->guide && $guidereview->transaction) {
                $guidereview->guide->increment('review');
                $guidereview->user->increment('review_count_guide');
            }
        });
    }

    protected $table = 'guide_reviews'; // specify the table name if it doesn't follow Laravel's naming convention
    protected $fillable = [
        'user_id',
        'guide_id',
        'transaction_id',
        'review_text',
    ]; // specify the fillable attributes for mass assignment

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'guide_id'); // every review belongs to one guide
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

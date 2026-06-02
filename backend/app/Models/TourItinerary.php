<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourItinerary extends Model
{

    protected $table = 'tour_itineraries'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'tour_id',
        'step_number',
        'start_time',
        'activity',
        'description',
    ]; // specify the fillable attributes for mass assignment

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id'); // every itinerary belongs to one tour
    }
}
    
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourImage extends Model
{

    protected $table = 'tour_images'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'tour_id',
        'image_path',
        'image_order',
        'image_caption',
    ]; // specify the fillable attributes for mass assignment

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id'); // every image belongs to one tour
    }
}

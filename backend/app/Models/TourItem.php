<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TourItem extends pivot
{
    // table name for the pivot model
    protected $table = 'tour_items';

    // fillable attributes for mass assignment
    protected $fillable = [
        'tour_id',
        'item_id',
        'is_included',
    ];

    // Cast the extra attribute to a boolean
    protected $casts = [
        'is_included' => 'boolean',
    ];
}

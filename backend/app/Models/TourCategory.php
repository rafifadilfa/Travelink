<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TourCategory extends pivot
{
    // table name for the pivot model
    protected $table = 'tour_categories';

    // fillable attributes for mass assignment
    protected $fillable = [
        'tour_id',
        'category_id',
    ];
}

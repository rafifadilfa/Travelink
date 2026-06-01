<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class TourTag extends Pivot
{
    protected $table = 'tour_tags';
    protected $fillable = ['tour_id', 'tag_id', 'is_included'];

    protected $casts = [
        'is_included' => 'boolean',
    ];
}

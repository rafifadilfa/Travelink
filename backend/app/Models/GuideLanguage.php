<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GuideLanguage extends Pivot
{
    protected $table = 'guide_languages';

    protected $fillable = [
        'guide_id',
        'language_id',
    ];
}

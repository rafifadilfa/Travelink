<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GuideSpeciality extends Pivot
{
    protected $table = 'guide_specialities';

    protected $fillable = [
        'guide_id',
        'speciality_id',
    ];
}

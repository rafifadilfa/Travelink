<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DayPhase extends Model
{

    protected $table = 'day_phases'; // specify the table name if it doesn't follow Laravel's naming convention
    
    protected $fillable = ['name', 'description']; // specify the fillable attributes for mass assignment

    public function tours()
    {
        return $this->hasMany(Tour::class, 'tour_period_id'); // every day phase can have many tours
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeetingPoint extends Model
{
    protected $fillable = [
        'name',
        'location_id',
    ];

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id'); // every meeting point belongs to one location
    }

    public function tours()
    {
        return $this->hasMany(Tour::class, 'tour_meeting_point_id'); // every meeting point can have many tours
    }
}

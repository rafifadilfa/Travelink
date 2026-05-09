<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{

    protected $table = 'locations'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'location_name',
        'country_id',
    ]; // specify the fillable attributes for mass assignment

    public function tours()
    {
        return $this->hasMany(Tour::class, 'tour_location_id'); // every location can have many tours
    }

    public function meetingPoints()
    {
        return $this->hasMany(MeetingPoint::class, 'location_id'); // every location can have many meeting points
    }

    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id'); // every location belongs to one country
    }
}

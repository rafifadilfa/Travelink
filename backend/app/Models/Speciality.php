<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Speciality extends Model
{

    protected $table = 'specialities'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'name',
    ]; // specify the fillable attributes for mass assignment

    public function guides()
    {
        return $this->belongsToMany(Guide::class, 'guide_specialities', 'speciality_id', 'guide_id')->withTimestamps(); // every speciality can be associated with many guides through guide_specialities
    }
}

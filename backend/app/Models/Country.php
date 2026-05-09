<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    
    protected $table = 'countries'; // specify the table name
    
    protected $fillable = ['country_name', 'ISO_code_2']; // specify the fill

    public function guides()
    {
        return $this->hasMany(Guide::class, 'country_id'); // every country can have many guides
    }

    public function locations()
    {
        return $this->hasMany(Location::class, 'country_id'); // every country can have many locations
    }

    public function phoneCountryCode()
    {
        return $this->hasOne(PhoneCountryCode::class, 'country_id'); // every country only have 1 phone country codes
    }
}

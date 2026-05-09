<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhoneCountryCode extends Model
{

    protected $table = 'phone_country_codes'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'country_id',
        'phone_country_code',
    ]; // specify the fillable attributes for mass assignment

    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id'); // every phone country code belongs to one country
    }
    
    public function users()
    {
        return $this->hasMany(User::class, 'phone_country_code_id'); // every phone country code can be used by many users
    }

    public function guides()
    {
        return $this->hasMany(Guide::class, 'phone_country_code_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Language extends Model
{

    protected $table = 'languages'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = ['name']; // specify the fillable attributes for mass assignment

    public function guides()
    {
        return $this->belongsToMany(Guide::class, 'guide_languages', 'language_id', 'guide_id')->withTimestamps(); // every language can be spoken by many guides through guide_languages
    }

    public function users()
    {
        return $this->hasMany(User::class, 'language_id');
    }
}

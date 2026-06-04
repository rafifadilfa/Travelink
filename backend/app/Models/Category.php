<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    
    protected $table = 'categories'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = ['name'];

    public function tour()
    {
        return $this->belongsToMany(Tour::class, 'tour_categories', 'category_id', 'tour_id')->withTimestamps();
    }

    /** Aktivitas Smart Open Trip yang termasuk dalam kategori ini */
    public function openTripActivities()
    {
        return $this->hasMany(\App\Models\OpenTripActivity::class, 'category_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenTripActivity extends Model
{
    protected $table = 'open_trip_activities';

    protected $fillable = ['name', 'category_id'];

    /** Kategori wisata yang memiliki aktivitas ini */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}

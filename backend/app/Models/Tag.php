<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{

    protected $table = 'tags'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = ['name']; // specify the fillable attributes for mass assignment

    public function tour()
    {
        //pivot table 'tour_tag' is used to associate tags with tours
        return $this->belongsToMany(Tour::class, 'tour_tags', 'tag_id', 'tour_id')->withTimestamps(); // every tag can be associated with many tours through tour_tag
    }
}

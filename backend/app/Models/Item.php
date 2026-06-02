<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{

    protected $table = 'items'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = [
        'name',
    ]; // specify the fillable attributes for mass assignment

    public function tour()
    {
        //pivot table 'tour_item' is used to associate items with tours
        return $this->belongsToMany(Tour::class, 'tour_items', 'item_id', 'tour_id')->withTimestamps(); // every item can be associated with many tours through tour_item
    }
}

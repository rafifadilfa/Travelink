<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    
    protected $table = 'categories'; // specify the table name if it doesn't follow Laravel's naming convention

    protected $fillable = ['category_name']; // specify the fillable attributes for mass assignment

    public function tour()
    {
        // pivot table 'tour_categories' is used to associate categories with tours
        return $this->belongsToMany(Tour::class, 'tour_categories', 'category_id', 'tour_id')->withTimestamps(); // every category can be associated with many tours through tour_categories
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tour extends Model
{
    use SoftDeletes;

    protected $table = 'tours';

    // Konstanta tipe tour
    const TYPE_REGULAR   = 'regular';
    const TYPE_OPEN_TRIP = 'open_trip'; // dikerjakan tim lain, placeholder saja

    // Konstanta status tour
    const TOUR_STATUS_DRAFT  = 'draft';
    const TOUR_STATUS_ACTIVE = 'active';

    protected $fillable = [
        'name',
        'type',
        'tour_location_id',
        'tour_meeting_point_id',
        'tour_description',
        'tour_guide_id',
        'tour_price',
        'tour_duration',
        'tour_start_time',
        'tour_period_id',
        'tour_max_participants',
        'tour_min_participants',
        'tour_status',
        'tour_rating',
        'featured',
        'is_open_trip',
    ]; // specify the fillable attributes for mass assignment

    public function location()
    {
        return $this->belongsTo(Location::class, 'tour_location_id');
    }

    public function meetingPoint()
    {
        return $this->belongsTo(MeetingPoint::class, 'tour_meeting_point_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'tour_tags', 'tour_id', 'tag_id')->withTimestamps();
    }

    public function images()
    {
        return $this->hasMany(TourImage::class, 'tour_id')->orderBy('image_order', 'asc');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'tour_categories', 'tour_id', 'category_id')->withTimestamps();
    }

    public function dayphase()
    {
        return $this->belongsTo(DayPhase::class, 'tour_period_id');
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'tour_items')
                    ->withPivot('is_included')
                    ->withTimestamps()
                    ->using(TourItem::class);
    }

    public function guide()
    {
        return $this->belongsTo(Guide::class, 'tour_guide_id');
    }

    public function itineraries()
    {
        return $this->hasMany(TourItinerary::class, 'tour_id')->orderBy('step_number', 'asc');
    }

    public function reviews()
    {
        return $this->hasMany(TourReview::class, 'tour_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'tour_id');
    }

    // Jadwal ketersediaan: hari-hari dalam seminggu (UC-14)
    public function availabilities()
    {
        return $this->hasMany(TourAvailability::class, 'tour_id')->orderBy('day_of_week');
    }

    protected $appends = ['slug'];

    public function getSlugAttribute(): string
    {
        return Str::slug($this->name);
    }
}

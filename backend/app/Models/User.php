<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'phone_country_code_id',
        'phone_number',
        'language_id',
        'profile_photo_path',
        'password',
        'review_count_guide',
        'review_count_tour',
        'ot_age',
        'ot_budget_level',
        'ot_interests',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'user_id');
    }

    public function phonecountrycode()
    {
        return $this->belongsTo(PhoneCountryCode::class, 'phone_country_code_id');
    }

    public function language()
    {
        return $this->belongsTo(Language::class, 'language_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'user_id');
    }

    public function guidereviews()
    {
        return $this->hasMany(GuideReview::class, 'user_id');
    }

    public function tourreviews()
    {
        return $this->hasMany(TourReview::class, 'user_id');
    }
}

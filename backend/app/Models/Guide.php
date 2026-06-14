<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Guide extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'guides';

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'phone_country_code_id',
        'phone_number',
        'country_id',
        'profile_picture',
        'about',
        'experience_years',
        'password',
        'rating',
        'verification_status',
        'ktp_document',
        'selfie_ktp_document',
        'certificate_document',
        'portfolio_document',
        'rejection_reason',
        'base_rate',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'pending_balance',
        'available_balance',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }


    public function languages()
    {
        return $this->belongsToMany(Language::class, 'guide_languages', 'guide_id', 'language_id')->withTimestamps();
    }

    public function tours()
    {
        return $this->hasMany(Tour::class, 'tour_guide_id');
    }

    public function reviews()
    {
        return $this->hasMany(GuideReview::class, 'guide_id');
    }

    public function specialities()
    {
        return $this->belongsToMany(Speciality::class, 'guide_specialities', 'guide_id', 'speciality_id')->withTimestamps();
    }

    public function country()
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    public function phoneCountryCode()
    {
        return $this->belongsTo(PhoneCountryCode::class, 'phone_country_code_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'guide_id');
    }
}

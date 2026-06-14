<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenTripParticipant extends Model
{
    protected $table = 'open_trip_participants';

    protected $fillable = [
        'user_id',
        'tour_id',
        'trip_date',
        'age',
        'budget_level',
        'status',
        'group_id',
        'matching_score',
        'registration_count',
        'payment_status',
        'midtrans_order_id',
        'confirmed_at',
        'income_settled_at',
        'guide_reviewed',
    ];

    protected $casts = [
        'trip_date'          => 'date',
        'confirmed_at'       => 'datetime',
        'income_settled_at'  => 'datetime',
        'age'                => 'integer',
        'budget_level'       => 'integer',
        'matching_score'     => 'float',
        'registration_count' => 'integer',
        'guide_reviewed'     => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    // Kriteria 2: minat wisata (M2M via participant_interests).
    public function interests()
    {
        return $this->belongsToMany(
            Category::class,
            'participant_interests',
            'participant_id',
            'category_id'
        );
    }

    // Kriteria 3: preferensi aktivitas (M2M via participant_preferences).
    public function preferences()
    {
        return $this->belongsToMany(
            OpenTripActivity::class,
            'participant_preferences',
            'participant_id',
            'activity_id'
        );
    }

    // null jika masih waiting
    public function group()
    {
        return $this->belongsTo(OpenTripGroup::class, 'group_id');
    }

    // Format profil untuk ProfileMatchingService.
    public function toProfileArray(): array
    {
        return [
            'age'          => $this->age,
            'interest_ids' => $this->interests->pluck('id')->toArray(),
            'preference_ids' => $this->preferences->pluck('id')->toArray(),
            'budget_level' => $this->budget_level,
        ];
    }
}

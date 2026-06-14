<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenTripGroup extends Model
{
    protected $table = 'open_trip_groups';

    protected $fillable = [
        'tour_id',
        'trip_date',
        'matched_at',
        'expires_at',
        'rejected_at',
        'confirmed_at',
        'sot_processed_at',
    ];

    protected $casts = [
        'trip_date'         => 'date',
        'matched_at'        => 'datetime',
        'expires_at'        => 'datetime',
        'rejected_at'       => 'datetime',
        'confirmed_at'      => 'datetime',
        'sot_processed_at'  => 'datetime',
    ];

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    public function participants()
    {
        return $this->hasMany(OpenTripParticipant::class, 'group_id');
    }

    public function isRejected(): bool
    {
        return $this->rejected_at !== null;
    }

    public function isActive(): bool
    {
        return $this->expires_at !== null && now()->lessThan($this->expires_at);
    }

    public function secondsRemaining(): int
    {
        if ($this->expires_at === null) return 0;
        return max(0, (int) now()->diffInSeconds($this->expires_at, false));
    }
}

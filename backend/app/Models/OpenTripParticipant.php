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
        'income_settled_at',
        'guide_reviewed',
    ];

    protected $casts = [
        'trip_date'          => 'date',
        'income_settled_at'  => 'datetime',
        'age'                => 'integer',
        'budget_level'       => 'integer',
        'matching_score'     => 'float',
        'registration_count' => 'integer',
        'guide_reviewed'     => 'boolean',
    ];

    // ── Relasi ──────────────────────────────────────────────────

    /** Wisatawan pemilik profil ini */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Tour yang diikuti sebagai Smart Open Trip */
    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    /**
     * Minat peserta (Kriteria 2) — kategori wisata yang dipilih.
     * Pivot: participant_interests (participant_id, category_id)
     */
    public function interests()
    {
        return $this->belongsToMany(
            Category::class,
            'participant_interests',
            'participant_id',
            'category_id'
        );
    }

    /**
     * Preferensi aktivitas peserta (Kriteria 3) — set aktivitas yang dipilih.
     * Pivot: participant_preferences (participant_id, activity_id)
     */
    public function preferences()
    {
        return $this->belongsToMany(
            OpenTripActivity::class,
            'participant_preferences',
            'participant_id',
            'activity_id'
        );
    }

    /** Grup tempat peserta ini tergabung (null jika masih waiting) */
    public function group()
    {
        return $this->belongsTo(OpenTripGroup::class, 'group_id');
    }

    // ── Helper: siapkan array profil untuk ProfileMatchingService ──

    /**
     * Kembalikan profil peserta sebagai array sederhana.
     * Format ini yang diterima ProfileMatchingService.
     */
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

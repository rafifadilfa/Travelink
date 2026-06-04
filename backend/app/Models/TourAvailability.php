<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Jadwal ketersediaan paket wisata per hari dalam seminggu (UC-14).
// day_of_week: 0=Minggu, 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
// (mengikuti konvensi PHP/Carbon dayOfWeek)
class TourAvailability extends Model
{
    protected $table = 'tour_availabilities';

    protected $fillable = ['tour_id', 'day_of_week'];

    // Label hari dalam Bahasa Indonesia untuk response API
    const DAY_LABELS = [
        0 => 'Minggu',
        1 => 'Senin',
        2 => 'Selasa',
        3 => 'Rabu',
        4 => 'Kamis',
        5 => 'Jumat',
        6 => 'Sabtu',
    ];

    public function tour()
    {
        return $this->belongsTo(Tour::class, 'tour_id');
    }

    // Accessor untuk label hari Indonesia
    public function getDayLabelAttribute(): string
    {
        return self::DAY_LABELS[$this->day_of_week] ?? 'Tidak Diketahui';
    }
}

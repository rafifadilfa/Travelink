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

    // ---------------------------------------------------------------
    // Konstanta verification_status — satu-satunya sumber kebenaran.
    // Label UI ada di frontend; nilai DB ada di sini.
    //
    // Alur: pending → menunggu_verifikasi → verified
    //                                     → rejected (bisa upload ulang → menunggu_verifikasi)
    // ---------------------------------------------------------------
    const STATUS_PENDING             = 'pending';            // Belum Diverifikasi
    const STATUS_MENUNGGU_VERIFIKASI = 'menunggu_verifikasi'; // Menunggu Verifikasi
    const STATUS_VERIFIED            = 'verified';           // Aktif
    const STATUS_REJECTED            = 'rejected';           // Ditolak

    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'phone_country_code_id',
        'phone_number',
        'country_id',
        'profile_picture',
        'about',
        'password',
        'rating',
        'experience_years',
        'verification_status',
        // KYC documents (UC-12)
        'ktp_document',
        'selfie_ktp_document',
        'certificate_document',
        'portfolio_document',
        'rejection_reason',
        // Profil profesional (UC-13)
        'base_rate',
        // Rekening bank (UC-13, UC-17)
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        // Saldo dompet (UC-17, UC-22)
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
            'pending_balance'   => 'decimal:2',
            'available_balance' => 'decimal:2',
            'base_rate'         => 'decimal:2',
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

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class, 'guide_id');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'guide_id');
    }
}

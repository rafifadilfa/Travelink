<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('open_trip_participants', function (Blueprint $table) {
            $table->id();

            // Peserta — wisatawan yang mendaftar
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Tour yang dibuka sebagai Smart Open Trip
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');

            // Tanggal trip yang dipilih peserta (pool = per tour + tanggal)
            $table->date('trip_date');

            // ── 4 Kriteria Profile Matching ────────────────────────────────────
            // 1. Umur — disimpan di sini (bukan di users) karena relevan per sesi
            $table->tinyInteger('age')->unsigned();

            // 2 & 3. Minat (interests) & Preference (preferences) → tabel pivot terpisah

            // 4. Budget — level 1-5 sesuai dokumen:
            //    1=<500rb, 2=500rb-1jt, 3=1-2jt, 4=2-5jt, 5=>5jt
            $table->tinyInteger('budget_level')->unsigned();

            // Status peserta di pool
            // waiting  = menunggu pasangan kompatibel
            // matched  = sudah masuk grup (countdown dimulai)
            // cancelled = membatalkan diri
            $table->enum('status', ['waiting', 'matched', 'cancelled'])->default('waiting');

            $table->timestamps();

            // Satu user tidak boleh daftar tour+tanggal yang sama lebih dari sekali
            $table->unique(['user_id', 'tour_id', 'trip_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('open_trip_participants');
    }
};

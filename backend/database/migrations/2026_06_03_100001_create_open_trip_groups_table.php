<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('open_trip_groups', function (Blueprint $table) {
            $table->id();

            // Pool tempat grup ini terbentuk
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            $table->date('trip_date');

            // Waktu grup terbentuk (Tahap 2 dimulai).
            // nullable agar MySQL strict mode tidak menolak tabel saat dibuat;
            // kode di formGroup() selalu mengisi nilai ini saat grup terbentuk.
            $table->timestamp('matched_at')->nullable();

            // Waktu countdown berakhir = matched_at + config('open_trip.countdown_minutes')
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('open_trip_groups');
    }
};

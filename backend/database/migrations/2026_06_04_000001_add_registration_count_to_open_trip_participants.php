<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            // Jumlah kali user mendaftar ke trip ini (tour_id + trip_date yang sama).
            // Dipakai untuk batasi re-registrasi setelah cancel: maksimal 3 kali.
            // Default 1 agar baris yang sudah ada tidak tiba-tiba bernilai 0.
            $table->unsignedTinyInteger('registration_count')
                ->default(1)
                ->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropColumn('registration_count');
        });
    }
};

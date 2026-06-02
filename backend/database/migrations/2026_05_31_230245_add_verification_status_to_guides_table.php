<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            // Ditambahkan setelah kolom 'rating' untuk menyimpan status verifikasi KYC pemandu.
            // Default 'pending' supaya setiap guide baru otomatis masuk antrian verifikasi.
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])
                  ->default('pending')
                  ->after('rating');
        });
    }

    public function down(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            $table->dropColumn('verification_status');
        });
    }
};

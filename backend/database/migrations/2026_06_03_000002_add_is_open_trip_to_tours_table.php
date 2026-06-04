<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            // Menandai apakah paket tour ini tersedia sebagai Smart Open Trip
            $table->boolean('is_open_trip')->default(false)->after('featured');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn('is_open_trip');
        });
    }
};

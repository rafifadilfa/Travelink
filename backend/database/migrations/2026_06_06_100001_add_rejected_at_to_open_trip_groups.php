<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_groups', function (Blueprint $table) {
            // Waktu pemandu menolak grup ini; null = belum ditolak
            $table->timestamp('rejected_at')->nullable()->after('expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_groups', function (Blueprint $table) {
            $table->dropColumn('rejected_at');
        });
    }
};

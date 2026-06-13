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
        Schema::table('open_trip_groups', function (Blueprint $table) {
            // Waktu job ProcessSmartOTResult selesai memproses grup (TC-057/058).
            // Null = belum diproses; not-null = sudah diproses (idempotency guard).
            $table->timestamp('sot_processed_at')->nullable()->after('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_groups', function (Blueprint $table) {
            $table->dropColumn('sot_processed_at');
        });
    }
};

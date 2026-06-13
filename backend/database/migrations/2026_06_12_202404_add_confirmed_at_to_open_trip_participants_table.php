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
        Schema::table('open_trip_participants', function (Blueprint $table) {
            // Waktu peserta mengkonfirmasi keikutsertaan dalam window 6 jam setelah countdown habis (TC-056).
            $table->timestamp('confirmed_at')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropColumn('confirmed_at');
        });
    }
};

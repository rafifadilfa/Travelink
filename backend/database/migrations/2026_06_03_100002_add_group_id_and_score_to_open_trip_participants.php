<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            // FK ke grup yang terbentuk (null = masih waiting)
            $table->foreignId('group_id')
                ->nullable()
                ->after('status')
                ->constrained('open_trip_groups')
                ->onDelete('set null');

            // Skor Profile Matching peserta terhadap profil acuan grup (0–5)
            // null = belum dicocokkan
            $table->decimal('matching_score', 4, 2)
                ->nullable()
                ->after('group_id');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropColumn(['group_id', 'matching_score']);
        });
    }
};

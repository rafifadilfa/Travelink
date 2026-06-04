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
        // Drop versi lama (FK ke items) sebelum buat ulang dengan FK ke open_trip_activities
        Schema::dropIfExists('participant_preferences');

        // Pivot: peserta ↔ preferensi aktivitas (surfing, berenang, hiking, dll)
        Schema::create('participant_preferences', function (Blueprint $table) {
            $table->foreignId('participant_id')
                ->constrained('open_trip_participants')->onDelete('cascade');
            $table->foreignId('activity_id')
                ->constrained('open_trip_activities')->onDelete('cascade');
            $table->primary(['participant_id', 'activity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participant_preferences');
    }
};

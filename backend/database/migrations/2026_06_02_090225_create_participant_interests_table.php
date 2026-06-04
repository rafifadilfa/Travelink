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
        // Pivot: peserta ↔ minat (kategori wisata seperti pantai, gunung, sejarah)
        Schema::create('participant_interests', function (Blueprint $table) {
            $table->foreignId('participant_id')
                ->constrained('open_trip_participants')->onDelete('cascade');
            $table->foreignId('category_id')
                ->constrained('categories')->onDelete('cascade');
            $table->primary(['participant_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participant_interests');
    }
};

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
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->foreignId('tour_location_id')->constrained('locations')->onDelete('cascade');
            $table->foreignId('tour_meeting_point_id')->constrained('meeting_points')->onDelete('cascade');
            $table->string('tour_description', 500);
            $table->foreignId('tour_guide_id')->constrained('guides')->onDelete('cascade');
            $table->integer('tour_price');
            $table->integer('tour_duration');
            $table->timestamp('tour_start_time');
            $table->foreignId('tour_period_id')->constrained('day_phases')->onDelete('cascade');
            $table->float('tour_rating')->default(0);
            $table->integer('tour_review_count')->default(0);
            $table->integer('tour_booking_count')->default(0);
            $table->integer('tour_max_participants')->default(1);
            $table->integer('tour_min_participants')->default(1);
            $table->string('tour_status')->default('draft');
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};

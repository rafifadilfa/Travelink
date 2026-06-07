<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->boolean('guide_reviewed')->default(false)->after('income_settled_at');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropColumn('guide_reviewed');
        });
    }
};

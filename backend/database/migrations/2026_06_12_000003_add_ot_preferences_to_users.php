<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('ot_age')->nullable()->after('profile_photo_path');
            $table->unsignedTinyInteger('ot_budget_level')->nullable()->after('ot_age');
            $table->text('ot_interests')->nullable()->after('ot_budget_level');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ot_age', 'ot_budget_level', 'ot_interests']);
        });
    }
};

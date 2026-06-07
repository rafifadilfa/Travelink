<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Pakai raw SQL agar tidak bergantung pada doctrine/dbal
        // dan agar foreign key constraint tetap terjaga
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_location_id      BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_meeting_point_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_start_time       TIMESTAMP NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_period_id        BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_description      VARCHAR(500) NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_duration         VARCHAR(100) NULL');
    }

    public function down(): void
    {
        // Kembalikan ke NOT NULL (akan gagal kalau sudah ada baris NULL)
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_location_id      BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_meeting_point_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_start_time       TIMESTAMP NOT NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_period_id        BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_description      VARCHAR(500) NOT NULL');
        DB::statement('ALTER TABLE tours MODIFY COLUMN tour_duration         INTEGER NOT NULL');
    }
};

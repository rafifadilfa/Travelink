<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Ubah kolom verification_status dari ENUM → VARCHAR agar nilai baru bisa ditambah
// tanpa mengubah migration lama. Nilai yang didukung didefinisikan sebagai konstanta
// di model Guide (satu-satunya sumber kebenaran).
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE guides MODIFY COLUMN verification_status VARCHAR(50) NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Hanya bisa rollback ke ENUM jika tidak ada data dengan nilai 'menunggu_verifikasi'
        DB::statement("ALTER TABLE guides MODIFY COLUMN verification_status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending'");
    }
};

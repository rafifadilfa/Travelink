<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabel permintaan pencairan dana pemandu (UC-17 pengajuan, UC-20 verifikasi admin).
// Snapshot rekening bank disimpan di sini agar riwayat tetap akurat meski pemandu
// mengganti rekening di kemudian hari.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('guides')->onDelete('cascade');
            $table->decimal('amount', 14, 2);

            // Snapshot rekening bank saat pengajuan
            $table->string('bank_name', 100);
            $table->string('bank_account_number', 50);
            $table->string('bank_account_holder', 100);

            // Status: menunggu_verifikasi | selesai | ditolak
            $table->string('status', 30)->default('menunggu_verifikasi');
            $table->text('rejection_reason')->nullable();

            // Admin yang memproses (UC-20)
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->foreign('processed_by')->references('id')->on('admins')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};

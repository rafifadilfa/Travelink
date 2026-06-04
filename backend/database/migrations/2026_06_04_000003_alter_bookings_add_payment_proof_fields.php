<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tambahkan kolom bukti pembayaran & timestamp verifikasi ke tabel bookings.
// Diperlukan untuk alur: wisatawan upload bukti bayar (UC-07/seeder) →
// admin verifikasi (UC-18).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Path file bukti pembayaran yang diupload wisatawan
            $table->string('payment_proof_path')->nullable()->after('cancelation_reason');
            // Kapan wisatawan mengirim bukti pembayaran
            $table->timestamp('paid_at')->nullable()->after('payment_proof_path');
            // Kapan & oleh admin siapa pembayaran diverifikasi (UC-18)
            $table->timestamp('payment_verified_at')->nullable()->after('paid_at');
            $table->unsignedBigInteger('payment_verified_by')->nullable()->after('payment_verified_at');
            $table->foreign('payment_verified_by')->references('id')->on('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['payment_verified_by']);
            $table->dropColumn(['payment_proof_path', 'paid_at', 'payment_verified_at', 'payment_verified_by']);
        });
    }
};

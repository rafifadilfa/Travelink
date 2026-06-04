<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Riwayat transaksi dompet pemandu untuk UC-22 (Dashboard Keuangan).
// Setiap mutasi saldo (pemasukan dari pesanan selesai, pencairan) dicatat di sini.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('guides')->onDelete('cascade');

            // Tipe: income (dari pesanan selesai) | withdrawal (pencairan)
            $table->string('type', 20);
            // Arah: credit (masuk) | debit (keluar)
            $table->string('direction', 10);
            $table->decimal('amount', 14, 2);

            // Referensi sumber mutasi (dua FK nullable, lebih sederhana dari polymorphic)
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->foreign('booking_id')->references('id')->on('bookings')->nullOnDelete();
            $table->unsignedBigInteger('withdrawal_id')->nullable();
            $table->foreign('withdrawal_id')->references('id')->on('withdrawals')->nullOnDelete();

            $table->string('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};

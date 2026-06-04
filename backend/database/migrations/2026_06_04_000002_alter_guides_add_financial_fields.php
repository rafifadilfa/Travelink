<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tambahkan kolom keuangan & KYC tambahan ke tabel guides untuk mendukung:
// - UC-13: Rekening bank & tarif dasar
// - UC-17 & UC-22: Saldo pending / available
// - UC-12: Selfie bersama KTP & portfolio trip
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            // Tarif dasar pemandu (UC-13)
            $table->decimal('base_rate', 14, 2)->nullable()->after('experience_years');

            // Rekening bank untuk pencairan dana (UC-13, UC-17)
            $table->string('bank_name', 100)->nullable()->after('base_rate');
            $table->string('bank_account_number', 50)->nullable()->after('bank_name');
            $table->string('bank_account_holder', 100)->nullable()->after('bank_account_number');

            // Saldo dompet pemandu (UC-22)
            // pending_balance: dari pesanan terkonfirmasi, trip belum selesai
            // available_balance: siap dicairkan (dari pesanan selesai)
            $table->decimal('pending_balance', 14, 2)->default(0)->after('bank_account_holder');
            $table->decimal('available_balance', 14, 2)->default(0)->after('pending_balance');

            // Dokumen KYC tambahan (UC-12)
            $table->string('selfie_ktp_document')->nullable()->after('ktp_document');
            $table->string('portfolio_document')->nullable()->after('selfie_ktp_document');
        });
    }

    public function down(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            $table->dropColumn([
                'base_rate',
                'bank_name', 'bank_account_number', 'bank_account_holder',
                'pending_balance', 'available_balance',
                'selfie_ktp_document', 'portfolio_document',
            ]);
        });
    }
};

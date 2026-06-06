<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tambah kolom income_settled_at untuk melacak kapan saldo pending
// peserta Open Trip dipindah ke available (escrow release).
// null  = belum di-settle (masih ditahan)
// timestamp = sudah di-settle (tersedia untuk dicairkan)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->timestamp('income_settled_at')->nullable()->after('midtrans_order_id');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropColumn('income_settled_at');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_reviews', function (Blueprint $table) {
            // Lepas FK lama agar bisa ubah kolom jadi nullable
            $table->dropForeign(['transaction_id']);

            // Buat transaction_id nullable (open trip tidak punya transaksi)
            $table->unsignedBigInteger('transaction_id')->nullable()->change();

            // Kembalikan FK dengan nullable
            $table->foreign('transaction_id')
                  ->references('id')->on('transactions')
                  ->onDelete('cascade');

            // Tambah participant_id untuk Smart Open Trip
            $table->unsignedBigInteger('participant_id')->nullable()->after('transaction_id');
            $table->foreign('participant_id')
                  ->references('id')->on('open_trip_participants')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('guide_reviews', function (Blueprint $table) {
            $table->dropForeign(['participant_id']);
            $table->dropColumn('participant_id');

            $table->dropForeign(['transaction_id']);
            $table->unsignedBigInteger('transaction_id')->nullable(false)->change();
            $table->foreign('transaction_id')
                  ->references('id')->on('transactions')
                  ->onDelete('cascade');
        });
    }
};

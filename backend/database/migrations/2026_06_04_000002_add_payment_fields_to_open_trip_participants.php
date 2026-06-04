<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            // Status pembayaran per anggota — null berarti belum masuk grup (Tahap 1)
            $table->enum('payment_status', ['unpaid', 'paid'])->nullable()->after('registration_count');

            // Order ID unik yang dikirim ke Midtrans, format: OT-{groupId}-{participantId}
            $table->string('midtrans_order_id')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('open_trip_participants', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'midtrans_order_id']);
        });
    }
};

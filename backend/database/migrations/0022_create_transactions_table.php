<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique(); // Unique code for the transaction (e.g., INV-123456)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('guide_id')->constrained('guides')->onDelete('cascade');
            $table->foreignId('tour_id')->constrained('tours')->onDelete('cascade');
            $table->integer('participant_count')->default(1); // Number of participants in the transaction
            $table->decimal('price_per_participant', 14, 2); // Price per participant
            $table->date('tour_date'); // Date of the tour
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('set null');
            $table->string('payment_status')->default('unpaid'); // pending, completed, failed
            $table->decimal('total_amount', 14, 2); // Amount in the smallest unit
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'sarah.anderson@example.com')->first();
        $transactions = Transaction::where('user_id', $user->id)->get();

        if (!$user || $transactions->isEmpty()) {
            // Use the 'command' property to output an error to the console
            $this->command->error('Could not find user or transactions to create bookings.');
            return; // Stop the seeder
        }

        Booking::truncate(); // Clear existing bookings before seeding

        foreach ($transactions as $transaction) {
            // Check if a booking already exists for this user and transaction
            if (Booking::where('user_id', $user->id)->where('transaction_id', $transaction->id)->exists()) {
                continue; // Skip to the next transaction if a booking already exists
            }

            Booking::create([
                'user_id' => $user->id,
                'transaction_id' => $transaction->id,
            ]);
        }
    }
}

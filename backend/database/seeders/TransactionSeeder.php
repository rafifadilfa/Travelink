<?php

namespace Database\Seeders;

use App\Models\Transaction;
use App\Models\Booking;
use App\Models\User;
use App\Models\Tour;
use App\Models\Guide;
use App\Models\PaymentMethod;
use App\Models\TourReview;
use App\Models\GuideReview;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Fetch the records that will be common to all transactions
        $user = User::where('email', 'sarah.anderson@example.com')->first();
        $guide = Guide::where('email', 'sarah.johnson@example.com')->first();
        $tour = Tour::where('name', 'Bali Beach Hopping Adventure')->first();
        $switch = 2;

        // 2. Fail early if any of the core records are not found.
        if (!$user || !$guide || !$tour) {
            // Use the 'command' property to output an error to the console
            $this->command->error('Could not find required User, Guide, or Tour to create transactions.');
            return; // Stop the seeder
        };

        // Clear existing transactions before seeding
        Transaction::truncate();

        // 3. Define the data for the transactions you want to create in an array
        $transactionsToCreate = [
            [
                'participant_count' => 2,
                'tour_date'         => '2025-05-10',
                'payment_method'    => 'Credit Card',
                'payment_status'    => 'paid',
            ],
            [
                'participant_count' => 2,
                'tour_date'         => '2025-05-11',
                'payment_method'    => 'Credit Card',
                'payment_status'    => 'paid',
            ],
            [
                'participant_count' => 3,
                'tour_date'         => '2026-05-15',
                'payment_status'    => 'unpaid',
            ],
            [
                'participant_count' => 3,
                'tour_date'         => '2026-05-16',
                'payment_status'    => 'unpaid',
            ],
        ];

        // 4. Loop through the array and create a transaction for each item
        foreach ($transactionsToCreate as $transactionData) {
            // Find the payment method for this specific transaction

            $transaction = Transaction::create([
                'user_id'               => $user->id,
                'guide_id'              => $guide->id,
                'tour_id'               => $tour->id,
                'participant_count'     => $transactionData['participant_count'],
                'price_per_participant' => $tour->tour_price,
                'tour_date'             => $transactionData['tour_date'],
                'total_amount'          => $tour->tour_price * $transactionData['participant_count'],
            ]);

            $tourDate = Carbon::parse($transaction->tour_date);

            // 2. Prepare the base data for the booking.
            $bookingData = [
                'user_id'        => $transaction->user_id,
                'transaction_id' => $transaction->id,
            ];

            // 3. Check if the tour date is in the past.
            if ($tourDate->isPast()) {

                $paymentMethod = PaymentMethod::where('name', '=', $transactionData['payment_method'])->first();

                $transaction->update([
                    'payment_method_id'     => $paymentMethod->id,
                    'payment_status'        => $transactionData['payment_status'],
                ]);

                if($switch % 2 === 0){
                    $bookingData['booking_status'] = 'completed';
                    $bookingData['tour_reviewed']  = true;
                    $bookingData['guide_reviewed'] = true;
                    
                    
                    TourReview::Create([
                        'transaction_id' => $transaction->id,
                        'tour_id' => $transaction->tour_id,
                        'user_id' => $transaction->user_id,
                        'rating' => 4,
                        'comment' => 'This is a test comment for tour',
                    ]);

                    GuideReview::Create([
                        'transaction_id' => $transaction->id,
                        'guide_id' => $transaction->guide_id,
                        'user_id' => $transaction->user_id,
                        'rating' => 4,
                        'comment' => 'This is a test comment for guide',
                    ]);

                    // Tour Review
                    $tourRating = $tour->reviews()->avg('rating');
                    $tour->update(['tour_rating' => $tourRating]);

                    // Guide Review
                    $guideRating = $guide->reviews()->avg('rating');
                    $guide->update(['rating' => $guideRating]);


                }else{
                    $bookingData['booking_status'] = 'completed';
                    $bookingData['tour_reviewed']  = false;
                    $bookingData['guide_reviewed'] = false;  
                }

                $switch += 1;


            } else {
                $bookingData['booking_status'] = 'pending';
            }

            // 4. Create the Booking record with the prepared data.
            Booking::create($bookingData);
        }
    }
}

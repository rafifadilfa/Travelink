<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $PaymentMethods = [
            'Credit Card',
            'Debit Card',
            'QRIS',
            'PayPal',
            'Bank Transfer',
            'Cash on Arrival',
        ];

        PaymentMethod::truncate(); // Clear existing payment methods before seeding

        foreach ($PaymentMethods as $method) {
            PaymentMethod::create([
                'name' => $method,
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Guide;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class WithdrawalSeeder extends Seeder
{
    public function run(): void
    {
        $guide = Guide::where('email', 'sarah.johnson@example.com')->first();
        $admin = Admin::first();

        if (!$guide) {
            $this->command->error('Guide sarah.johnson tidak ditemukan. Jalankan GuideSeeder dulu.');
            return;
        }

        // ----------------------------------------------------------------
        // Withdrawal 1: SELESAI — sudah diproses admin (data historis)
        // WalletService::debitAvailable() mengurus pengurangan saldo + wallet_transaction
        // ----------------------------------------------------------------
        $withdrawal1 = Withdrawal::create([
            'guide_id'            => $guide->id,
            'amount'              => 2000000,
            'bank_name'           => $guide->bank_name,
            'bank_account_number' => $guide->bank_account_number,
            'bank_account_holder' => $guide->bank_account_holder,
            'status'              => Withdrawal::STATUS_SELESAI,
            'processed_by'        => $admin?->id,
            'processed_at'        => Carbon::now()->subWeeks(2),
        ]);

        WalletService::debitAvailable($guide, $withdrawal1);

        // ----------------------------------------------------------------
        // Withdrawal 2: MENUNGGU VERIFIKASI — baru diajukan (untuk UC-20)
        // Saldo belum dikurangi — admin yang akan memproses
        // ----------------------------------------------------------------
        Withdrawal::create([
            'guide_id'            => $guide->id,
            'amount'              => 1000000,
            'bank_name'           => $guide->bank_name,
            'bank_account_number' => $guide->bank_account_number,
            'bank_account_holder' => $guide->bank_account_holder,
            'status'              => Withdrawal::STATUS_MENUNGGU_VERIFIKASI,
        ]);

        $guide->refresh();
        $this->command->info(
            "WithdrawalSeeder: 2 withdrawal dibuat. " .
            "Saldo available guide sekarang: Rp " . number_format($guide->available_balance, 0, ',', '.')
        );
    }
}

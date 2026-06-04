<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Guide;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;

/**
 * Satu-satunya tempat untuk semua mutasi saldo pemandu.
 * Semua controller, command, dan seeder WAJIB memanggil method ini —
 * jangan menyalin logika increment/decrement atau pembuatan WalletTransaction di tempat lain.
 *
 * Alur saldo:
 *   creditPending()  — saat admin verifikasi pembayaran (UC-18)
 *   settle()         — saat trip selesai via command bookings:settle (A1)
 *   debitAvailable() — saat admin proses pencairan (UC-20)
 */
class WalletService
{
    /**
     * Tambah pending_balance guide saat pembayaran diverifikasi admin.
     * Belum membuat wallet_transaction — itu baru dibuat saat settle().
     * ASUMSI A2: komisi 0%, nominal penuh masuk ke pemandu.
     *
     * @param Guide $guide
     * @param float $amount Nominal pesanan (total_amount)
     */
    public static function creditPending(Guide $guide, float $amount): void
    {
        $commission  = $amount * (config('travelink.platform_commission_percent', 0) / 100);
        $guideAmount = $amount - $commission;

        $guide->increment('pending_balance', $guideAmount);
    }

    /**
     * Pindahkan saldo dari pending → available saat trip dinyatakan selesai.
     * Sekaligus membuat catatan wallet_transaction (income/credit).
     * Dipanggil oleh command bookings:settle dan juga oleh seeder (untuk data historis).
     *
     * @param Guide   $guide
     * @param float   $amount    Nominal yang dipindah (sama dengan yang di-creditPending sebelumnya)
     * @param Booking $booking   Referensi pesanan (untuk deskripsi & booking_id)
     */
    public static function settle(Guide $guide, float $amount, Booking $booking): void
    {
        $booking->loadMissing('transaction');
        $txCode = $booking->transaction?->transaction_code ?? "Pesanan #{$booking->id}";

        DB::transaction(function () use ($guide, $amount, $booking, $txCode) {
            $guide->decrement('pending_balance', $amount);
            $guide->increment('available_balance', $amount);

            WalletTransaction::create([
                'guide_id'    => $guide->id,
                'type'        => WalletTransaction::TYPE_INCOME,
                'direction'   => WalletTransaction::DIRECTION_CREDIT,
                'amount'      => $amount,
                'booking_id'  => $booking->id,
                'description' => "Pendapatan trip diselesaikan: {$txCode}",
            ]);
        });
    }

    /**
     * Kurangi available_balance saat admin memproses pencairan dana.
     * Sekaligus membuat catatan wallet_transaction (withdrawal/debit).
     * Dipanggil oleh AdminWithdrawalApiController dan juga oleh seeder.
     *
     * @param Guide      $guide
     * @param Withdrawal $withdrawal Objek pencairan (untuk amount, bank info, dan withdrawal_id)
     */
    public static function debitAvailable(Guide $guide, Withdrawal $withdrawal): void
    {
        DB::transaction(function () use ($guide, $withdrawal) {
            $guide->decrement('available_balance', $withdrawal->amount);

            WalletTransaction::create([
                'guide_id'      => $guide->id,
                'type'          => WalletTransaction::TYPE_WITHDRAWAL,
                'direction'     => WalletTransaction::DIRECTION_DEBIT,
                'amount'        => $withdrawal->amount,
                'withdrawal_id' => $withdrawal->id,
                'description'   => "Pencairan dana ke {$withdrawal->bank_name} {$withdrawal->bank_account_number}",
            ]);
        });
    }
}

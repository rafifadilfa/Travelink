<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Guide;
use App\Models\OpenTripParticipant;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;

// Satu-satunya tempat mutasi saldo pemandu — jangan salin logika increment/decrement di tempat lain.
// Alur: creditPending (UC-18) → settle/bookings:settle (A1) → debitAvailable (UC-20).
class WalletService
{
    // Tambah pending_balance saat pembayaran diverifikasi (UC-18). Wallet_transaction dibuat saat settle(). ASUMSI A2: komisi 0%.
    public static function creditPending(Guide $guide, float $amount): void
    {
        $commission  = $amount * (config('travelink.platform_commission_percent', 0) / 100);
        $guideAmount = $amount - $commission;

        $guide->increment('pending_balance', $guideAmount);
    }

    // Pindah pending → available saat trip selesai; buat WalletTransaction. Dipanggil bookings:settle & seeder.
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

    // Pindah pending → available untuk peserta Smart Open Trip; buat WalletTransaction & tandai income_settled_at. Dipanggil opentrip:settle.
    public static function settleOpenTrip(Guide $guide, float $amount, OpenTripParticipant $participant): void
    {
        $participant->loadMissing(['group.tour']);
        $tourName = $participant->group?->tour?->name ?? "Grup #{$participant->group_id}";
        $tripDate = $participant->trip_date?->format('d/m/Y') ?? '-';

        DB::transaction(function () use ($guide, $amount, $participant, $tourName, $tripDate) {
            $guide->decrement('pending_balance', $amount);
            $guide->increment('available_balance', $amount);

            WalletTransaction::create([
                'guide_id'    => $guide->id,
                'type'        => WalletTransaction::TYPE_INCOME,
                'direction'   => WalletTransaction::DIRECTION_CREDIT,
                'amount'      => $amount,
                'description' => "Pendapatan Smart Open Trip: {$tourName} ({$tripDate})",
            ]);

            $participant->update(['income_settled_at' => now()]);
        });
    }

    // Kurangi available_balance saat admin proses pencairan; buat WalletTransaction withdrawal. Dipanggil AdminWithdrawalApiController & seeder.
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

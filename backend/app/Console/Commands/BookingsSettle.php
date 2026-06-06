<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Console\Command;

// ASUMSI A1: Pesanan berstatus terkonfirmasi dengan tour_date sudah lewat
// otomatis menjadi selesai. Saldo pending pemandu dipindah ke available via WalletService::settle().
//
// Penggunaan normal (cek tanggal):
//   php artisan bookings:settle
//
// Mode demo / paksa (abaikan tanggal — untuk sidang/demonstrasi):
//   php artisan bookings:settle --force
//
// Dijadwalkan tiap hari di routes/console.php.
class BookingsSettle extends Command
{
    protected $signature   = 'bookings:settle {--force : Abaikan cek tour_date (untuk demo/sidang)}';
    protected $description = 'Selesaikan pesanan terkonfirmasi yang tanggal tripnya sudah lewat dan cairkan saldo pending.';

    public function handle(): int
    {
        $force = $this->option('force');
        $today = Carbon::today();

        if ($force) {
            $this->warn('Mode --force aktif: semua pesanan terkonfirmasi akan diproses tanpa cek tanggal.');
        }

        $query = Booking::where('booking_status', Booking::STATUS_TERKONFIRMASI)
            ->with('transaction.guide');

        if (! $force) {
            $query->whereHas('transaction', fn($q) => $q->where('tour_date', '<', $today));
        }

        $bookings = $query->get();

        $count = 0;

        foreach ($bookings as $booking) {
            $transaction = $booking->transaction;
            $guide       = $transaction->guide;

            if (!$guide) {
                continue;
            }

            // Ubah status pesanan → selesai
            $booking->update(['booking_status' => Booking::STATUS_SELESAI]);

            // ASUMSI A2: komisi 0% — nominal penuh. WalletService::settle() menangani
            // pending→available dan pembuatan wallet_transaction.
            WalletService::settle($guide, $transaction->total_amount, $booking);

            $count++;
        }

        $this->info("Berhasil menyelesaikan {$count} pesanan (pending → available balance).");

        return Command::SUCCESS;
    }
}

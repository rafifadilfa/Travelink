<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;

// ASUMSI A3: Pesanan dengan status menunggu_konfirmasi_pemandu yang belum diproses
// selama lebih dari 24 jam otomatis dibatalkan menjadi dibatalkan_otomatis.
// Jalankan via: php artisan bookings:auto-cancel
// Dijadwalkan tiap jam di routes/console.php.
class BookingsAutoCancel extends Command
{
    protected $signature   = 'bookings:auto-cancel';
    protected $description = 'Batalkan otomatis pesanan yang belum dikonfirmasi pemandu dalam 24 jam.';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subHours(24);

        $query = Booking::where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->where('created_at', '<=', $cutoff);

        $count = $query->count();

        $query->update([
            'booking_status'     => Booking::STATUS_DIBATALKAN_OTOMATIS,
            'cancelation_reason' => 'Dibatalkan otomatis: tidak ada konfirmasi dari pemandu dalam 24 jam.',
        ]);

        $this->info("Berhasil membatalkan {$count} pesanan (auto-cancel 24 jam).");

        return Command::SUCCESS;
    }
}

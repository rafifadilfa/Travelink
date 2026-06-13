<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Console\Command;

// TC-045: Pesanan menunggu_konfirmasi_pemandu > 24 jam → dibatalkan_otomatis.
// TC-049: Pesanan menunggu_pembayaran > 24 jam → dibatalkan_otomatis.
// Dijadwalkan tiap jam di routes/console.php.
class BookingsAutoCancel extends Command
{
    protected $signature   = 'bookings:auto-cancel';
    protected $description = 'Batalkan otomatis pesanan yang melewati batas waktu konfirmasi atau pembayaran.';

    public function handle(): int
    {
        $cutoff = Carbon::now()->subHours(24);

        // TC-045: auto-cancel jika pemandu tidak merespons dalam 24 jam
        $pendingGuideQuery = Booking::where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->where('created_at', '<=', $cutoff);
        $pendingGuideCount = $pendingGuideQuery->count();
        $pendingGuideQuery->update([
            'booking_status'     => Booking::STATUS_DIBATALKAN_OTOMATIS,
            'cancelation_reason' => 'Dibatalkan otomatis: tidak ada konfirmasi dari pemandu dalam 24 jam.',
        ]);

        // TC-049: auto-cancel jika wisatawan tidak membayar dalam 24 jam
        $unpaidQuery = Booking::where('booking_status', Booking::STATUS_MENUNGGU_PEMBAYARAN)
            ->where('updated_at', '<=', $cutoff);
        $unpaidCount = $unpaidQuery->count();
        $unpaidQuery->update([
            'booking_status'     => Booking::STATUS_DIBATALKAN_OTOMATIS,
            'cancelation_reason' => 'Dibatalkan otomatis: pembayaran tidak diterima dalam 24 jam.',
        ]);

        $total = $pendingGuideCount + $unpaidCount;
        $this->info("Auto-cancel: {$pendingGuideCount} menunggu konfirmasi + {$unpaidCount} menunggu bayar = {$total} total.");

        return Command::SUCCESS;
    }
}

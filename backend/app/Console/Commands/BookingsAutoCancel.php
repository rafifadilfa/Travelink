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
        $guideConfirmMinutes = config('booking.guide_confirm_timeout_minutes', 1440);
        $paymentMinutes      = config('booking.payment_timeout_minutes', 1440);

        // TC-045: auto-cancel jika pemandu tidak merespons dalam batas waktu
        $guideConfirmCutoff = Carbon::now()->subMinutes($guideConfirmMinutes);
        $pendingGuideQuery  = Booking::where('booking_status', Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU)
            ->where('created_at', '<=', $guideConfirmCutoff);
        $pendingGuideCount = $pendingGuideQuery->count();
        $pendingGuideQuery->update([
            'booking_status'     => Booking::STATUS_DIBATALKAN_OTOMATIS,
            'cancelation_reason' => "Dibatalkan otomatis: tidak ada konfirmasi dari pemandu dalam {$guideConfirmMinutes} menit.",
        ]);

        // TC-049: auto-cancel jika wisatawan tidak membayar dalam batas waktu
        $paymentCutoff = Carbon::now()->subMinutes($paymentMinutes);
        $unpaidQuery   = Booking::where('booking_status', Booking::STATUS_MENUNGGU_PEMBAYARAN)
            ->where('updated_at', '<=', $paymentCutoff);
        $unpaidCount = $unpaidQuery->count();
        $unpaidQuery->update([
            'booking_status'     => Booking::STATUS_DIBATALKAN_OTOMATIS,
            'cancelation_reason' => "Dibatalkan otomatis: pembayaran tidak diterima dalam {$paymentMinutes} menit.",
        ]);

        $total = $pendingGuideCount + $unpaidCount;
        $this->info("Auto-cancel: {$pendingGuideCount} menunggu konfirmasi + {$unpaidCount} menunggu bayar = {$total} total.");

        return Command::SUCCESS;
    }
}

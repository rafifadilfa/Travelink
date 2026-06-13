<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\OpenTripGroup;
use App\Models\OpenTripParticipant;
use App\Models\Transaction;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * TC-057 & TC-058: Proses hasil akhir Smart Open Trip setelah window konfirmasi 6 jam berakhir.
 *
 * Logika:
 *   - Temukan grup: expires_at + 6 jam ≤ now() DAN sot_processed_at IS NULL DAN rejected_at IS NULL
 *   - Ada yang konfirmasi (TC-057): keluarkan non-konfirmasi, buat Booking per peserta → pemandu
 *   - Tidak ada konfirmasi (TC-058): batalkan semua, kirim notifikasi
 */
class ProcessSmartOTResult extends Command
{
    protected $signature   = 'opentrip:process-results';
    protected $description = 'Proses hasil akhir Smart Open Trip setelah window konfirmasi 6 jam habis.';

    public function handle(): int
    {
        $cutoff = now()->subHours(6);

        $groups = OpenTripGroup::with([
            'tour:id,name,tour_price,tour_guide_id',
            'tour.guide:id,name',
            'participants' => fn($q) => $q->where('status', 'matched'),
        ])
            ->whereNull('rejected_at')
            ->whereNull('sot_processed_at')
            ->where('expires_at', '<=', $cutoff)
            ->get();

        if ($groups->isEmpty()) {
            $this->info('Tidak ada grup yang perlu diproses.');
            return Command::SUCCESS;
        }

        $this->info("Memproses {$groups->count()} grup...");

        foreach ($groups as $group) {
            DB::transaction(fn() => $this->processGroup($group));
        }

        $this->info('Selesai.');
        return Command::SUCCESS;
    }

    private function processGroup(OpenTripGroup $group): void
    {
        $all          = $group->participants;
        $confirmed    = $all->filter(fn($p) => $p->confirmed_at !== null);
        $notConfirmed = $all->filter(fn($p) => $p->confirmed_at === null);
        $tour         = $group->tour;
        $guideId      = $tour?->tour_guide_id;
        $tourName     = $tour?->name ?? 'paket wisata';

        if ($confirmed->isEmpty()) {
            // TC-058: tidak ada yang konfirmasi → batalkan semua
            OpenTripParticipant::where('group_id', $group->id)
                ->where('status', 'matched')
                ->update(['status' => 'cancelled']);

            foreach ($all as $p) {
                NotificationService::send(
                    'sot_cancelled_no_confirm', 'user', $p->user_id,
                    'Smart Open Trip Dibatalkan',
                    "Smart Open Trip \"{$tourName}\" dibatalkan karena tidak ada peserta yang mengkonfirmasi keikutsertaan.",
                    ['group_id' => $group->id, 'tour_id' => $group->tour_id]
                );
            }

            $this->line("  Grup #{$group->id}: dibatalkan (0 konfirmasi).");
        } else {
            // TC-057: ada yang konfirmasi → keluarkan non-konfirmasi, buat booking
            foreach ($notConfirmed as $p) {
                $p->update(['status' => 'cancelled']);
                NotificationService::send(
                    'sot_removed_no_confirm', 'user', $p->user_id,
                    'Kamu Dikeluarkan dari Smart Open Trip',
                    "Kamu dikeluarkan dari Smart Open Trip \"{$tourName}\" karena tidak mengkonfirmasi dalam batas waktu.",
                    ['group_id' => $group->id, 'tour_id' => $group->tour_id]
                );
            }

            $count         = $confirmed->count();
            $pricePerPerson = (int) ceil(($tour?->tour_price ?? 0) / max(1, $count));
            $tripDate      = $group->trip_date->toDateString();

            foreach ($confirmed as $p) {
                $transaction = Transaction::create([
                    'user_id'               => $p->user_id,
                    'guide_id'              => $guideId,
                    'tour_id'               => $group->tour_id,
                    'participant_count'     => 1,
                    'price_per_participant' => $pricePerPerson,
                    'tour_date'             => $tripDate,
                    'payment_status'        => 'pending',
                    'total_amount'          => $pricePerPerson,
                ]);

                Booking::create([
                    'user_id'        => $p->user_id,
                    'transaction_id' => $transaction->id,
                    'booking_status' => Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
                ]);

                NotificationService::send(
                    'sot_booking_created', 'user', $p->user_id,
                    'Pesanan Smart Open Trip Dibuat',
                    "Pesanan Smart Open Trip \"{$tourName}\" telah dikirim ke pemandu. Menunggu konfirmasi.",
                    ['group_id' => $group->id, 'tour_id' => $group->tour_id]
                );
            }

            if ($guideId) {
                NotificationService::send(
                    'sot_new_bookings', 'guide', $guideId,
                    'Pesanan Smart Open Trip Masuk',
                    "{$count} peserta Smart Open Trip \"{$tourName}\" menunggu konfirmasi Anda.",
                    ['group_id' => $group->id, 'tour_id' => $group->tour_id]
                );
            }

            $this->line("  Grup #{$group->id}: {$count} booking dibuat, {$notConfirmed->count()} dikeluarkan.");
        }

        $group->update(['sot_processed_at' => now()]);
    }
}

<?php

namespace App\Console\Commands;

use App\Models\OpenTripParticipant;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Selesaikan escrow Smart Open Trip: pindahkan saldo pending → available
 * untuk setiap peserta yang sudah bayar dan trip-nya sudah lewat.
 *
 * Penggunaan normal (cek tanggal):
 *   php artisan opentrip:settle
 *
 * Mode demo / paksa (abaikan tanggal — untuk sidang/demonstrasi):
 *   php artisan opentrip:settle --force
 */
class OpenTripSettle extends Command
{
    protected $signature   = 'opentrip:settle {--force : Abaikan cek trip_date (untuk demo/sidang)}';
    protected $description = 'Cairkan saldo escrow Smart Open Trip yang trip-nya sudah selesai (pending → available).';

    public function handle(): int
    {
        $force = $this->option('force');
        $today = Carbon::today();

        if ($force) {
            $this->warn('Mode --force aktif: semua peserta paid yang belum settled akan diproses tanpa cek tanggal.');
        }

        // Query peserta: sudah bayar, belum di-settle, dan (kecuali --force) trip_date sudah lewat
        $query = OpenTripParticipant::where('payment_status', 'paid')
            ->whereNull('income_settled_at')
            ->with(['group.tour.guide']);

        if (! $force) {
            // Hanya settle grup yang trip_date-nya sudah lewat
            $query->whereHas('group', fn ($q) => $q->where('trip_date', '<', $today));
        }

        $participants = $query->get();

        if ($participants->isEmpty()) {
            $this->info('Tidak ada peserta yang perlu di-settle.');
            return Command::SUCCESS;
        }

        $count  = 0;
        $errors = 0;

        foreach ($participants as $participant) {
            $group = $participant->group;

            if (! $group || ! $group->tour || ! $group->tour->guide) {
                $this->warn("  Peserta #{$participant->id}: relasi grup/tour/guide tidak ditemukan — dilewati.");
                $errors++;
                continue;
            }

            $guide = $group->tour->guide;

            // Hitung jumlah anggota aktif di grup (matched) untuk split bill
            $memberCount = OpenTripParticipant::where('group_id', $group->id)
                ->where('status', 'matched')
                ->count();

            if ($memberCount < 1) {
                $this->warn("  Peserta #{$participant->id}: grup #{$group->id} tidak punya anggota aktif — dilewati.");
                $errors++;
                continue;
            }

            $amountPerPerson = (int) ceil($group->tour->tour_price / $memberCount);

            try {
                WalletService::settleOpenTrip($guide, $amountPerPerson, $participant);

                $this->line(sprintf(
                    '  ✓ Peserta #%d | Guide: %s | Trip: %s (%s) | +Rp %s',
                    $participant->id,
                    $guide->name,
                    $group->tour->name,
                    $group->trip_date?->format('d/m/Y') ?? '-',
                    number_format($amountPerPerson, 0, ',', '.'),
                ));

                $count++;
            } catch (\Throwable $e) {
                $this->error("  Peserta #{$participant->id}: gagal — {$e->getMessage()}");
                $errors++;
            }
        }

        $this->newLine();
        $this->info("Selesai: {$count} peserta di-settle, {$errors} error.");

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}

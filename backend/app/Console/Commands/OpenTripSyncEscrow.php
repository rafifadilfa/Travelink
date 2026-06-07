<?php

namespace App\Console\Commands;

use App\Models\OpenTripParticipant;
use App\Services\WalletService;
use Illuminate\Console\Command;

/**
 * Backfill satu kali: kredit pending_balance guide untuk setiap peserta Smart Open Trip
 * yang sudah payment_status='paid' tapi income_settled_at masih null.
 *
 * Dibutuhkan karena WalletService::creditPending() sebelumnya gagal diam-diam
 * (kolom pending_balance belum ada di DB).
 *
 * Gunakan --dry-run untuk melihat apa yang akan diproses tanpa mengubah data.
 *
 *   php artisan opentrip:sync-escrow --dry-run
 *   php artisan opentrip:sync-escrow
 */
class OpenTripSyncEscrow extends Command
{
    protected $signature   = 'opentrip:sync-escrow {--dry-run : Tampilkan daftar tanpa mengubah data}';
    protected $description = 'Backfill pending_balance guide untuk peserta Open Trip yang sudah paid tapi belum tercatat (satu kali pakai).';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Mode --dry-run: tidak ada data yang diubah.');
        }

        // Cari peserta: sudah bayar, belum di-settle ke available, masih dalam grup
        $participants = OpenTripParticipant::where('payment_status', 'paid')
            ->whereNull('income_settled_at')
            ->with(['group.tour.guide'])
            ->get();

        if ($participants->isEmpty()) {
            $this->info('Tidak ada peserta yang perlu di-sync.');
            return Command::SUCCESS;
        }

        $this->info("Ditemukan {$participants->count()} peserta paid yang belum tercatat di escrow guide.");
        $this->newLine();

        $count  = 0;
        $errors = 0;

        foreach ($participants as $participant) {
            $group = $participant->group;

            if (! $group || ! $group->tour || ! $group->tour->guide) {
                $this->warn("  Peserta #{$participant->id}: relasi grup/tour/guide tidak lengkap — dilewati.");
                $errors++;
                continue;
            }

            $guide = $group->tour->guide;

            $memberCount = OpenTripParticipant::where('group_id', $group->id)
                ->where('status', 'matched')
                ->count();

            if ($memberCount < 1) {
                $this->warn("  Peserta #{$participant->id}: grup #{$group->id} tidak punya anggota aktif — dilewati.");
                $errors++;
                continue;
            }

            $amountPerPerson = (int) ceil($group->tour->tour_price / $memberCount);

            $this->line(sprintf(
                '  %s Peserta #%d | Guide: %s | Tour: %s | +Rp %s',
                $dryRun ? '[DRY]' : '✓',
                $participant->id,
                $guide->name,
                $group->tour->name,
                number_format($amountPerPerson, 0, ',', '.'),
            ));

            if (! $dryRun) {
                try {
                    WalletService::creditPending($guide, $amountPerPerson);
                    $count++;
                } catch (\Throwable $e) {
                    $this->error("  Peserta #{$participant->id}: gagal — {$e->getMessage()}");
                    $errors++;
                }
            } else {
                $count++;
            }
        }

        $this->newLine();

        if ($dryRun) {
            $this->info("Dry-run selesai: {$count} peserta akan di-sync, {$errors} akan dilewati.");
            $this->line('Jalankan tanpa --dry-run untuk menerapkan perubahan.');
        } else {
            $this->info("Selesai: {$count} peserta di-sync, {$errors} error.");
        }

        return $errors > 0 ? Command::FAILURE : Command::SUCCESS;
    }
}

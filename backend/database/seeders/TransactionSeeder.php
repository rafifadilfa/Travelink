<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Booking;
use App\Models\Guide;
use App\Models\GuideReview;
use App\Models\PaymentMethod;
use App\Models\Tour;
use App\Models\TourReview;
use App\Models\Transaction;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user       = \App\Models\User::where('email', 'sarah.anderson@example.com')->first();
        $guide      = Guide::where('email', 'sarah.johnson@example.com')->first();
        $tour       = Tour::where('name', 'Bali Beach Hopping Adventure')->first();
        $admin      = Admin::first();
        $creditCard = PaymentMethod::where('name', 'Credit Card')->first();

        if (!$user || !$guide || !$tour) {
            $this->command->error('User, Guide, atau Tour tidak ditemukan. Jalankan seeder lain dulu.');
            return;
        }

        // Buat placeholder bukti pembayaran (1×1 transparent GIF)
        $placeholder = base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
        Storage::disk('public')->makeDirectory('payment_proofs');
        Storage::disk('public')->put('payment_proofs/seeder_placeholder.jpg', $placeholder);

        // Bersihkan tabel terkait (FK checks dikelola DatabaseSeeder secara global)
        WalletTransaction::truncate();
        Withdrawal::truncate();
        Booking::truncate();
        Transaction::truncate();

        $price = $tour->tour_price; // 1,200,000

        // Reset saldo guide ke 0 sebelum membangun ulang dari data historis
        $guide->update(['pending_balance' => 0, 'available_balance' => 0]);

        // ----------------------------------------------------------------
        // Semua skenario pesanan — satu per status (selesai dibuat 2x)
        // ----------------------------------------------------------------
        $scenarios = [
            // 1. Menunggu Konfirmasi Pemandu
            [
                'participants'   => 2,
                'tour_date'      => '2026-07-01',
                'payment_status' => 'unpaid',
                'booking_status' => Booking::STATUS_MENUNGGU_KONFIRMASI_PEMANDU,
            ],
            // 2. Menunggu Pembayaran
            [
                'participants'   => 2,
                'tour_date'      => '2026-07-10',
                'payment_status' => 'unpaid',
                'booking_status' => Booking::STATUS_MENUNGGU_PEMBAYARAN,
            ],
            // 3. Menunggu Verifikasi Pembayaran
            [
                'participants'       => 3,
                'tour_date'          => '2026-07-20',
                'payment_status'     => 'unpaid',
                'booking_status'     => Booking::STATUS_MENUNGGU_VERIFIKASI_PEMBAYARAN,
                'payment_proof_path' => 'payment_proofs/seeder_placeholder.jpg',
                'paid_at'            => Carbon::now()->subDays(1),
            ],
            // 4. Terkonfirmasi — trip masa depan, saldo masuk pending
            [
                'participants'        => 2,
                'tour_date'           => '2026-08-15',
                'payment_status'      => 'paid',
                'payment_method'      => $creditCard,
                'booking_status'      => Booking::STATUS_TERKONFIRMASI,
                'payment_proof_path'  => 'payment_proofs/seeder_placeholder.jpg',
                'paid_at'             => Carbon::now()->subDays(5),
                'payment_verified_at' => Carbon::now()->subDays(4),
                'payment_verified_by' => $admin?->id,
                'wallet_credit_pending' => true,
            ],
            // 5. Selesai (A) — dengan ulasan
            [
                'participants'        => 2,
                'tour_date'           => '2026-03-10',
                'payment_status'      => 'paid',
                'payment_method'      => $creditCard,
                'booking_status'      => Booking::STATUS_SELESAI,
                'payment_proof_path'  => 'payment_proofs/seeder_placeholder.jpg',
                'paid_at'             => Carbon::parse('2026-03-07'),
                'payment_verified_at' => Carbon::parse('2026-03-08'),
                'payment_verified_by' => $admin?->id,
                'tour_reviewed'       => true,
                'guide_reviewed'      => true,
                'wallet_settle'       => true,
            ],
            // 6. Selesai (B) — tanpa ulasan
            [
                'participants'        => 3,
                'tour_date'           => '2026-04-15',
                'payment_status'      => 'paid',
                'payment_method'      => $creditCard,
                'booking_status'      => Booking::STATUS_SELESAI,
                'payment_proof_path'  => 'payment_proofs/seeder_placeholder.jpg',
                'paid_at'             => Carbon::parse('2026-04-12'),
                'payment_verified_at' => Carbon::parse('2026-04-13'),
                'payment_verified_by' => $admin?->id,
                'tour_reviewed'       => false,
                'guide_reviewed'      => false,
                'wallet_settle'       => true,
            ],
            // 7. Ditolak
            [
                'participants'       => 1,
                'tour_date'          => '2026-07-25',
                'payment_status'     => 'unpaid',
                'booking_status'     => Booking::STATUS_DITOLAK,
                'cancelation_reason' => 'Maaf, tanggal tersebut sudah penuh.',
            ],
            // 8. Dibatalkan
            [
                'participants'       => 2,
                'tour_date'          => '2026-07-30',
                'payment_status'     => 'unpaid',
                'booking_status'     => Booking::STATUS_DIBATALKAN,
                'cancelation_reason' => 'Wisatawan membatalkan karena perubahan jadwal.',
            ],
            // 9. Dibatalkan Otomatis (A3)
            [
                'participants'         => 1,
                'tour_date'            => '2026-08-05',
                'payment_status'       => 'unpaid',
                'booking_status'       => Booking::STATUS_DIBATALKAN_OTOMATIS,
                'cancelation_reason'   => 'Dibatalkan otomatis: tidak ada konfirmasi dari pemandu dalam 24 jam.',
                'created_offset_hours' => -25,
            ],
        ];

        foreach ($scenarios as $s) {
            $totalAmount = $price * $s['participants'];

            $transaction = Transaction::create([
                'user_id'               => $user->id,
                'guide_id'              => $guide->id,
                'tour_id'               => $tour->id,
                'participant_count'     => $s['participants'],
                'price_per_participant' => $price,
                'tour_date'             => $s['tour_date'],
                'total_amount'          => $totalAmount,
                'payment_status'        => $s['payment_status'],
                'payment_method_id'     => $s['payment_method']?->id ?? null,
            ]);

            $booking = Booking::create([
                'user_id'             => $user->id,
                'transaction_id'      => $transaction->id,
                'booking_status'      => $s['booking_status'],
                'tour_reviewed'       => $s['tour_reviewed'] ?? false,
                'guide_reviewed'      => $s['guide_reviewed'] ?? false,
                'cancelation_reason'  => $s['cancelation_reason'] ?? null,
                'payment_proof_path'  => $s['payment_proof_path'] ?? null,
                'paid_at'             => $s['paid_at'] ?? null,
                'payment_verified_at' => $s['payment_verified_at'] ?? null,
                'payment_verified_by' => $s['payment_verified_by'] ?? null,
            ]);

            // Geser created_at untuk skenario dibatalkan_otomatis (simulasi A3)
            if (isset($s['created_offset_hours'])) {
                $booking->created_at = Carbon::now()->addHours($s['created_offset_hours']);
                $booking->save();
            }

            // Skenario TERKONFIRMASI → creditPending via WalletService
            if ($s['wallet_credit_pending'] ?? false) {
                WalletService::creditPending($guide, $totalAmount);
            }

            // Skenario SELESAI → creditPending lalu settle via WalletService
            // (mensimulasikan alur lengkap: verified → settled)
            if ($s['wallet_settle'] ?? false) {
                WalletService::creditPending($guide, $totalAmount);
                WalletService::settle($guide, $totalAmount, $booking);

                // Buat ulasan jika ditandai
                if ($s['tour_reviewed'] ?? false) {
                    TourReview::create([
                        'transaction_id' => $transaction->id,
                        'tour_id'        => $tour->id,
                        'user_id'        => $user->id,
                        'rating'         => 4,
                        'comment'        => 'Pengalaman luar biasa! Pemandu sangat profesional dan ramah.',
                    ]);
                    GuideReview::create([
                        'transaction_id' => $transaction->id,
                        'guide_id'       => $guide->id,
                        'user_id'        => $user->id,
                        'rating'         => 5,
                        'comment'        => 'Sarah adalah pemandu terbaik yang pernah saya temui!',
                    ]);
                }
            }
        }

        // Update rating tour & guide dari ulasan
        $tourRating = $tour->reviews()->avg('rating');
        if ($tourRating) {
            $tour->update(['tour_rating' => $tourRating, 'tour_review_count' => $tour->reviews()->count()]);
        }
        $guideRating = $guide->reviews()->avg('rating');
        if ($guideRating) {
            $guide->update(['rating' => $guideRating]);
        }

        $guide->refresh();
        $this->command->info(
            "TransactionSeeder: 9 pesanan dibuat. " .
            "Saldo guide: pending=Rp " . number_format($guide->pending_balance, 0, ',', '.') .
            ", available=Rp " . number_format($guide->available_balance, 0, ',', '.')
        );
    }
}

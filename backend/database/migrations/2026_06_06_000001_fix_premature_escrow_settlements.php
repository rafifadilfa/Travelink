<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Perbaikan data: batalkan settle prematur akibat opentrip:settle --force yang
// dijalankan tanpa cek tanggal trip pada 2026-06-06 05:48:21.
//
// 3 peserta Smart Open Trip (trip_date masa depan) terlanjur dipindah ke
// available_balance. Migration ini mengembalikan mereka ke pending_balance.
//
// Yang dilakukan per peserta bermasalah:
//   1. Hapus 1 wallet_transaction income yang sesuai
//   2. Kurangi available_balance guide sejumlah amount
//   3. Tambah pending_balance guide sejumlah amount
//   4. Reset income_settled_at peserta → null
return new class extends Migration
{
    public function up(): void
    {
        // Tanggal referensi: hari ini saat bug terjadi (sebelum trip selesai = trip_date > hari ini)
        $today = Carbon::parse('2026-06-06')->startOfDay();

        // Cari peserta yang sudah di-settle tapi trip_date grup masih masa depan
        $badParticipants = DB::table('open_trip_participants as p')
            ->join('open_trip_groups as g', 'p.group_id', '=', 'g.id')
            ->join('tours as t', 'g.tour_id', '=', 't.id')
            ->join('guides as gu', 't.tour_guide_id', '=', 'gu.id')
            ->where('p.payment_status', 'paid')
            ->whereNotNull('p.income_settled_at')
            ->where('g.trip_date', '>', $today)
            ->select(
                'p.id as participant_id',
                'p.group_id',
                'gu.id as guide_id',
                'g.trip_date',
                't.tour_price',
            )
            ->get();

        if ($badParticipants->isEmpty()) {
            return;
        }

        foreach ($badParticipants as $row) {
            // Hitung amount per orang (sama dengan logika WalletService::settleOpenTrip)
            $memberCount = DB::table('open_trip_participants')
                ->where('group_id', $row->group_id)
                ->where('status', 'matched')
                ->count();

            if ($memberCount < 1) {
                continue;
            }

            $amountPerPerson   = (int) ceil($row->tour_price / $memberCount);
            $tripDateFormatted = Carbon::parse($row->trip_date)->format('d/m/Y');

            // Hapus tepat SATU wallet_transaction yang sesuai (iterasi satu per satu mencegah
            // penghapusan ganda untuk grup dengan 2 peserta yang punya amount identik)
            $wtId = DB::table('wallet_transactions')
                ->where('guide_id', $row->guide_id)
                ->where('type', 'income')
                ->where('direction', 'credit')
                ->where('amount', $amountPerPerson)
                ->where('description', 'LIKE', "%({$tripDateFormatted})")
                ->value('id');

            if ($wtId) {
                DB::table('wallet_transactions')->where('id', $wtId)->delete();
            }

            // Kembalikan saldo: available → pending
            DB::table('guides')
                ->where('id', $row->guide_id)
                ->update([
                    'available_balance' => DB::raw("available_balance - {$amountPerPerson}"),
                    'pending_balance'   => DB::raw("pending_balance + {$amountPerPerson}"),
                ]);

            // Reset income_settled_at → null (belum settle)
            DB::table('open_trip_participants')
                ->where('id', $row->participant_id)
                ->update(['income_settled_at' => null]);
        }
    }

    // Rollback data keuangan tidak diimplementasi — terlalu berbahaya untuk dilakukan otomatis.
    public function down(): void {}
};

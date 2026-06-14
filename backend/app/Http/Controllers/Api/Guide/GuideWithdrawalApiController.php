<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pengajuan pencairan dana oleh pemandu (UC-17).
 * Dilindungi EnsureGuideIsVerified.
 */
class GuideWithdrawalApiController extends Controller
{
    // POST /api/guide/withdrawals — UC-17: pengajuan pencairan dana
    public function store(Request $request): JsonResponse
    {
        $guide = $request->user();

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $amount = (float) $validated['amount'];

        // A1: validasi saldo mencukupi
        if ($amount > $guide->available_balance) {
            return response()->json([
                'message'           => "Saldo tidak mencukupi. Saldo available Anda saat ini adalah Rp " .
                    number_format($guide->available_balance, 0, ',', '.'),
                'available_balance' => (float) $guide->available_balance,
            ], 422);
        }

        // A2: rekening bank harus sudah diisi
        if (empty($guide->bank_name) || empty($guide->bank_account_number) || empty($guide->bank_account_holder)) {
            return response()->json([
                'message'  => 'Rekening bank belum dilengkapi. Silakan isi data rekening bank di halaman profil terlebih dahulu.',
                'redirect' => '/guide/profile',
            ], 422);
        }

        // Snapshot rekening bank saat pengajuan (agar riwayat tetap akurat bila rekening diganti kelak)
        $withdrawal = Withdrawal::create([
            'guide_id'            => $guide->id,
            'amount'              => $amount,
            'bank_name'           => $guide->bank_name,
            'bank_account_number' => $guide->bank_account_number,
            'bank_account_holder' => $guide->bank_account_holder,
            'status'              => Withdrawal::STATUS_MENUNGGU_VERIFIKASI,
        ]);

        // TODO: notifikasi admin (out of scope)

        return response()->json([
            'message'    => 'Permintaan pencairan berhasil diajukan. Admin akan memproses dalam 1-3 hari kerja.',
            'withdrawal' => [
                'id'                  => $withdrawal->id,
                'amount'              => (float) $withdrawal->amount,
                'bank_name'           => $withdrawal->bank_name,
                'bank_account_number' => $withdrawal->bank_account_number,
                'bank_account_holder' => $withdrawal->bank_account_holder,
                'status'              => $withdrawal->status,
                'created_at'          => $withdrawal->created_at,
            ],
        ], 201);
    }
}

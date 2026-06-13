<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Withdrawal;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Pengajuan pencairan dana oleh pemandu (UC-17).
 * Dilindungi EnsureGuideIsVerified.
 */
class GuideWithdrawalApiController extends Controller
{
    // ================================================================
    // GET /api/guide/withdrawals
    // Riwayat semua pengajuan pencairan milik pemandu yang login
    // ================================================================
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();

        $withdrawals = Withdrawal::where('guide_id', $guide->id)
            ->orderByDesc('created_at')
            ->paginate(10);

        $items = $withdrawals->map(function (Withdrawal $w) {
            return [
                'id'                  => $w->id,
                'amount'              => (float) $w->amount,
                'bank_name'           => $w->bank_name,
                'bank_account_number' => $w->bank_account_number,
                'bank_account_holder' => $w->bank_account_holder,
                'status'              => $w->status,
                'rejection_reason'    => $w->rejection_reason,
                'processed_at'        => $w->processed_at,
                'created_at'          => $w->created_at,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page'    => $withdrawals->lastPage(),
                'total'        => $withdrawals->total(),
            ],
        ]);
    }

    // ================================================================
    // POST /api/guide/withdrawals
    // UC-17: Melakukan Pencairan Dana
    // ================================================================
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

        // TC-71: notifikasi semua admin ada pengajuan pencairan baru
        $amountFormatted = number_format($amount, 0, ',', '.');
        Admin::all()->each(function (Admin $admin) use ($guide, $withdrawal, $amountFormatted) {
            NotificationService::send(
                'withdrawal_requested',
                'admin',
                $admin->id,
                'Permintaan Pencairan Baru',
                "{$guide->name} mengajukan pencairan dana Rp {$amountFormatted} ke {$withdrawal->bank_name} a.n. {$withdrawal->bank_account_holder}.",
                ['withdrawal_id' => $withdrawal->id, 'guide_id' => $guide->id]
            );
        });

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

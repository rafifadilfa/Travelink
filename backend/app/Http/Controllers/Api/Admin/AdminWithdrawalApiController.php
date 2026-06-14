<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Withdrawal;
use App\Services\NotificationService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Verifikasi pencairan dana oleh admin (UC-20).
 * Dilindungi EnsureIsAdmin.
 */
class AdminWithdrawalApiController extends Controller
{
    // Helper: format withdrawal untuk response
    private function formatWithdrawal(Withdrawal $withdrawal): array
    {
        return [
            'id'                  => $withdrawal->id,
            'amount'              => (float) $withdrawal->amount,
            'bank_name'           => $withdrawal->bank_name,
            'bank_account_number' => $withdrawal->bank_account_number,
            'bank_account_holder' => $withdrawal->bank_account_holder,
            'status'              => $withdrawal->status,
            'rejection_reason'    => $withdrawal->rejection_reason,
            'processed_at'        => $withdrawal->processed_at,
            'created_at'          => $withdrawal->created_at,
            'guide' => $withdrawal->guide ? [
                'id'                => $withdrawal->guide->id,
                'name'              => $withdrawal->guide->name,
                'email'             => $withdrawal->guide->email,
                'available_balance' => (float) $withdrawal->guide->available_balance,
                'bank_name'         => $withdrawal->guide->bank_name,
                'bank_account_number' => $withdrawal->guide->bank_account_number,
            ] : null,
        ];
    }

    // GET /api/admin/withdrawals — UC-20: daftar withdrawal menunggu_verifikasi
    public function index(): JsonResponse
    {
        $withdrawals = Withdrawal::where('status', Withdrawal::STATUS_MENUNGGU_VERIFIKASI)
            ->with('guide:id,name,email,available_balance,bank_name,bank_account_number')
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return response()->json([
            'data' => collect($withdrawals->items())->map(fn($w) => $this->formatWithdrawal($w)),
            'meta' => [
                'current_page' => $withdrawals->currentPage(),
                'last_page'    => $withdrawals->lastPage(),
                'total'        => $withdrawals->total(),
            ],
        ], 200);
    }

    // GET /api/admin/withdrawals/{id}
    public function show(int $id): JsonResponse
    {
        $withdrawal = Withdrawal::with('guide')->findOrFail($id);

        return response()->json(['withdrawal' => $this->formatWithdrawal($withdrawal)], 200);
    }

    // POST /api/admin/withdrawals/{id}/process — UC-20: transfer + tandai selesai, debitAvailable guide
    public function process(Request $request, int $id): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user();

        $withdrawal = Withdrawal::where('status', Withdrawal::STATUS_MENUNGGU_VERIFIKASI)
            ->with('guide')
            ->findOrFail($id);

        $guide = $withdrawal->guide;

        // A2: validasi saldo masih mencukupi saat diproses
        if ($guide->available_balance < $withdrawal->amount) {
            return response()->json([
                'message'           => 'Saldo available pemandu tidak mencukupi untuk memproses pencairan ini.',
                'available_balance' => (float) $guide->available_balance,
                'withdrawal_amount' => (float) $withdrawal->amount,
            ], 422);
        }

        $withdrawal->update([
            'status'       => Withdrawal::STATUS_SELESAI,
            'processed_by' => $admin->id,
            'processed_at' => now(),
        ]);

        // WalletService adalah satu-satunya yang boleh ubah saldo
        WalletService::debitAvailable($guide, $withdrawal);

        $withdrawal->load('guide');

        $amountFormatted = number_format($withdrawal->amount, 0, ',', '.');

        NotificationService::send(
            'withdrawal_processed',
            'guide',
            $guide->id,
            'Pencairan Dana Diproses',
            "Pencairan dana Rp {$amountFormatted} telah diproses. Dana sudah ditransfer ke rekening Anda.",
            ['withdrawal_id' => $withdrawal->id]
        );

        return response()->json([
            'message'    => "Pencairan Rp {$amountFormatted} untuk {$guide->name} berhasil diproses.",
            'withdrawal' => $this->formatWithdrawal($withdrawal),
        ], 200);
    }

    // POST /api/admin/withdrawals/{id}/reject — UC-20 A1: data rekening tidak valid → ditolak
    public function reject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $withdrawal = Withdrawal::where('status', Withdrawal::STATUS_MENUNGGU_VERIFIKASI)
            ->with('guide')
            ->findOrFail($id);

        $withdrawal->update([
            'status'           => Withdrawal::STATUS_DITOLAK,
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        $amountFormatted = number_format($withdrawal->amount, 0, ',', '.');

        NotificationService::send(
            'withdrawal_rejected',
            'guide',
            $withdrawal->guide->id,
            'Pencairan Dana Ditolak',
            "Permintaan pencairan Rp {$amountFormatted} ditolak. Alasan: {$validated['rejection_reason']}. Silakan perbarui rekening bank Anda di halaman profil dan ajukan ulang.",
            ['withdrawal_id' => $withdrawal->id]
        );

        return response()->json([
            'message'    => 'Permintaan pencairan ditolak.',
            'withdrawal' => $this->formatWithdrawal($withdrawal),
        ], 200);
    }
}

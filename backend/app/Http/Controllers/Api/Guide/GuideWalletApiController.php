<?php

namespace App\Http\Controllers\Api\Guide;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Dashboard keuangan pemandu (UC-22).
 * Dilindungi EnsureGuideIsVerified.
 */
class GuideWalletApiController extends Controller
{
    // GET /api/guide/wallet?type=income|withdrawal — UC-22: dashboard keuangan
    public function index(Request $request): JsonResponse
    {
        $guide = $request->user();

        // Total income = pending + available + withdrawn. wallet_transactions hanya berisi
        // income yang sudah settle, sehingga tidak bisa dipakai untuk total termasuk pending.
        $totalWithdrawn = Withdrawal::where('guide_id', $guide->id)
            ->where('status', Withdrawal::STATUS_SELESAI)
            ->sum('amount');
        $totalIncome = $guide->pending_balance + $guide->available_balance + (float) $totalWithdrawn;

        $txQuery = WalletTransaction::where('guide_id', $guide->id)
            ->orderBy('created_at', 'desc');

        if ($request->filled('type')) {
            $txQuery->where('type', $request->get('type'));
        }

        $transactions = $txQuery->paginate(15);

        return response()->json([
            'wallet' => [
                'pending_balance'   => (float) $guide->pending_balance,
                'available_balance' => (float) $guide->available_balance,
                'total_income'      => (float) $totalIncome,
                // A2: tombol dinonaktifkan jika saldo = 0
                'can_withdraw'      => $guide->available_balance > 0,
            ],
            'data' => collect($transactions->items())->map(fn($t) => [
                'id'            => $t->id,
                'type'          => $t->type,
                'direction'     => $t->direction,
                'amount'        => (float) $t->amount,
                'description'   => $t->description,
                'booking_id'    => $t->booking_id,
                'withdrawal_id' => $t->withdrawal_id,
                'created_at'    => $t->created_at,
            ]),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'total'        => $transactions->total(),
            ],
        ], 200);
    }
}

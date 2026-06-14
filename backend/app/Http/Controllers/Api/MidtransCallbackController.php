<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\OpenTripParticipant;
use App\Models\Transaction;
use App\Services\NotificationService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

// TC-047: Webhook Midtrans. Signature = SHA512(order_id+status_code+gross_amount+server_key)
// Format order_id: PT-{bookingId}-{ts} (Private) | OT-{groupId}-{participantId}-{ts} (Open Trip)
class MidtransCallbackController extends Controller
{
    // POST /api/payment/midtrans/callback
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        $orderId          = $payload['order_id']          ?? '';
        $statusCode       = $payload['status_code']       ?? '';
        $grossAmount      = $payload['gross_amount']      ?? '';
        $signatureKey     = $payload['signature_key']     ?? '';
        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus      = $payload['fraud_status']      ?? 'accept';

        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if (! hash_equals($expectedSignature, $signatureKey)) {
            Log::warning('Midtrans callback: signature tidak valid.', ['order_id' => $orderId]);
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $isPaid = $transactionStatus === 'settlement'
            || ($transactionStatus === 'capture' && $fraudStatus === 'accept');

        if (! $isPaid) {
            // Status lain (pending, deny, expire, cancel) — tidak perlu update booking
            return response()->json(['message' => 'Notifikasi diterima.'], 200);
        }

        // Private Trip: PT-{bookingId}-{timestamp}
        if (str_starts_with($orderId, 'PT-')) {
            $this->handlePrivateTripPayment($orderId);
            return response()->json(['message' => 'OK'], 200);
        }

        // Open Trip: OT-{groupId}-{participantId}-{timestamp}
        if (str_starts_with($orderId, 'OT-')) {
            $this->handleOpenTripPayment($orderId);
            return response()->json(['message' => 'OK'], 200);
        }

        Log::warning('Midtrans callback: format order_id tidak dikenal.', ['order_id' => $orderId]);
        return response()->json(['message' => 'Unknown order type.'], 200);
    }

    private function handlePrivateTripPayment(string $orderId): void
    {
        $transaction = Transaction::where('midtrans_order_id', $orderId)
            ->with(['booking', 'tour.guide', 'user'])
            ->first();

        if (! $transaction) {
            Log::warning('Midtrans callback: transaksi tidak ditemukan.', ['order_id' => $orderId]);
            return;
        }

        $booking = $transaction->booking;
        if (! $booking) return;

        // Idempoten: jika sudah terkonfirmasi, lewati
        if ($booking->booking_status === Booking::STATUS_TERKONFIRMASI) return;

        $booking->update([
            'booking_status' => Booking::STATUS_TERKONFIRMASI,
            'paid_at'        => now(),
        ]);

        $transaction->update(['payment_status' => 'paid']);

        // Kredit pending_balance guide (escrow)
        if ($transaction->tour?->guide) {
            WalletService::creditPending($transaction->tour->guide, (int) $transaction->total_amount);
        }

        if ($transaction->user_id) {
            $tourName = $transaction->tour?->name ?? 'paket wisata';
            NotificationService::send(
                'payment_confirmed', 'user', $transaction->user_id,
                'Pembayaran Dikonfirmasi',
                "Pembayaran untuk \"{$tourName}\" berhasil. Booking Anda terkonfirmasi.",
                ['booking_id' => $booking->id]
            );
        }

        if ($guideId = $transaction->guide_id) {
            $tourName = $transaction->tour?->name ?? 'paket wisata';
            NotificationService::send(
                'new_payment_received', 'guide', $guideId,
                'Pembayaran Diterima',
                "Wisatawan telah menyelesaikan pembayaran untuk \"{$tourName}\".",
                ['booking_id' => $booking->id]
            );
        }
    }

    private function handleOpenTripPayment(string $orderId): void
    {
        $participant = OpenTripParticipant::where('midtrans_order_id', $orderId)
            ->with(['group.tour.guide', 'user'])
            ->first();

        if (! $participant) {
            Log::warning('Midtrans OT callback: participant tidak ditemukan.', ['order_id' => $orderId]);
            return;
        }

        // Idempoten
        if ($participant->payment_status === 'paid') return;

        $participant->update(['payment_status' => 'paid']);

        // Kredit escrow
        $group = $participant->group;
        if ($group && $group->tour?->guide) {
            $memberCount     = OpenTripParticipant::where('group_id', $group->id)
                ->where('status', 'matched')->count();
            $amountPerPerson = (int) ceil($group->tour->tour_price / max(1, $memberCount));
            WalletService::creditPending($group->tour->guide, $amountPerPerson);
        }

        // Notifikasi wisatawan
        if ($participant->user_id) {
            $tourName = $group?->tour?->name ?? 'Smart Open Trip';
            NotificationService::send(
                'ot_payment_confirmed', 'user', $participant->user_id,
                'Pembayaran Open Trip Dikonfirmasi',
                "Pembayaran untuk Smart Open Trip \"{$tourName}\" berhasil dikonfirmasi.",
                ['participant_id' => $participant->id]
            );
        }
    }
}

<?php

namespace App\Services;

use App\Jobs\ProcessPayment;
use App\Models\User;
use App\Services\ERP\ERPManager;
use App\Services\ERP\DataTransferObjects\PaymentDTO;
use DateTime;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private ERPManager $erpManager;
    private InvoiceService $invoiceService;

    public function __construct(ERPManager $erpManager, InvoiceService $invoiceService)
    {
        $this->erpManager = $erpManager;
        $this->invoiceService = $invoiceService;
    }

    public function createPayment(
        User $user,
        string $invoiceId,
        float $amount,
        string $paymentMethod = 'Card',
        ?string $reference = null,
        bool $async = true
    ): bool {
        if (!$user->customer_id) {
            Log::warning('Payment attempt without customer_id', [
                'user_id' => $user->id,
            ]);
            return false;
        }

        try {
            $invoice = $this->invoiceService->getInvoice($invoiceId);

            if (!$invoice) {
                Log::error('Payment attempted for non-existent invoice', [
                    'user_id' => $user->id,
                    'invoice_id' => $invoiceId,
                ]);
                return false;
            }

            if ($invoice->customerId !== $user->customer_id) {
                Log::error('Payment attempted for invoice belonging to different customer', [
                    'user_id' => $user->id,
                    'invoice_customer_id' => $invoice->customerId,
                    'user_customer_id' => $user->customer_id,
                ]);
                return false;
            }

            if ($amount > $invoice->outstanding) {
                Log::warning('Payment amount exceeds outstanding amount', [
                    'user_id' => $user->id,
                    'invoice_id' => $invoiceId,
                    'amount' => $amount,
                    'outstanding' => $invoice->outstanding,
                ]);
            }

            $ref = $reference ?? 'SELFCARE-' . time();

            if ($async) {
                ProcessPayment::dispatch(
                    $user->id,
                    $user->customer_id,
                    $invoiceId,
                    $amount,
                    $paymentMethod,
                    $ref
                );

                Log::info('Payment queued for processing', [
                    'user_id' => $user->id,
                    'invoice_id' => $invoiceId,
                    'amount' => $amount,
                    'reference' => $ref,
                ]);

                return true;
            } else {
                $payment = new PaymentDTO(
                    customerId: $user->customer_id,
                    invoiceId: $invoiceId,
                    amount: $amount,
                    paymentDate: new DateTime(),
                    reference: $ref,
                    paymentMethod: $paymentMethod
                );

                $erp = $this->erpManager->driver();
                $result = $erp->createPayment($payment);

                if ($result) {
                    Log::info('Payment created successfully (sync)', [
                        'user_id' => $user->id,
                        'invoice_id' => $invoiceId,
                        'amount' => $amount,
                        'reference' => $ref,
                    ]);

                    $this->invoiceService->refreshInvoiceCache($user->customer_id);
                }

                return $result;
            }
        } catch (\Exception $e) {
            Log::error('Failed to create payment', [
                'user_id' => $user->id,
                'invoice_id' => $invoiceId,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function getPaymentHistory(User $user): Collection
    {
        if (!$user->customer_id) {
            return collect();
        }

        try {
            $erp = $this->erpManager->driver();
            return $erp->getPaymentHistory($user->customer_id);
        } catch (\Exception $e) {
            Log::error('Failed to fetch payment history', [
                'user_id' => $user->id,
                'customer_id' => $user->customer_id,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    public function getPaymentStatus(string $paymentId): ?string
    {
        try {
            $erp = $this->erpManager->driver();
            return $erp->getPaymentStatus($paymentId);
        } catch (\Exception $e) {
            Log::error('Failed to get payment status', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
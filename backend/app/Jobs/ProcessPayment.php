<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ERP\DataTransferObjects\PaymentDTO;
use App\Services\ERP\ERPManager;
use App\Services\InvoiceService;
use DateTime;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessPayment implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public $tries = 5;
    public $backoff = [60, 300, 900, 1800, 3600];
    public $timeout = 180;

    public function __construct(
        public int $userId,
        public string $customerId,
        public string $invoiceId,
        public float $amount,
        public string $paymentMethod,
        public string $reference
    ) {}

    public function handle(ERPManager $erpManager, InvoiceService $invoiceService): void
    {
        try {
            $payment = new PaymentDTO(
                customerId: $this->customerId,
                invoiceId: $this->invoiceId,
                amount: $this->amount,
                paymentDate: new DateTime(),
                reference: $this->reference,
                paymentMethod: $this->paymentMethod
            );

            $erp = $erpManager->driver();
            $result = $erp->createPayment($payment);

            if ($result) {
                $invoiceService->refreshInvoiceCache($this->customerId);

                Log::info('Payment processed successfully', [
                    'user_id' => $this->userId,
                    'customer_id' => $this->customerId,
                    'invoice_id' => $this->invoiceId,
                    'amount' => $this->amount,
                    'reference' => $this->reference,
                ]);
            } else {
                throw new \Exception('Payment creation returned false');
            }
        } catch (\Exception $e) {
            Log::error('Failed to process payment', [
                'user_id' => $this->userId,
                'customer_id' => $this->customerId,
                'invoice_id' => $this->invoiceId,
                'amount' => $this->amount,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts(),
            ]);

            if ($this->attempts() >= $this->tries) {
                $this->fail($e);
            } else {
                throw $e;
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Payment processing job failed permanently', [
            'user_id' => $this->userId,
            'customer_id' => $this->customerId,
            'invoice_id' => $this->invoiceId,
            'amount' => $this->amount,
            'error' => $exception->getMessage(),
        ]);
    }
}
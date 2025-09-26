<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ERP\ERPManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncCustomerData implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];
    public $timeout = 120;

    public function __construct(
        public string $customerId
    ) {}

    public function handle(ERPManager $erpManager): void
    {
        try {
            $erp = $erpManager->driver();
            $customer = $erp->getCustomer($this->customerId);

            if ($customer) {
                Cache::put("customer:{$this->customerId}", $customer, 300);

                Log::info('Customer data synced successfully', [
                    'customer_id' => $this->customerId,
                ]);
            } else {
                Log::warning('Customer not found during sync', [
                    'customer_id' => $this->customerId,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to sync customer data', [
                'customer_id' => $this->customerId,
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
        Log::error('Customer sync job failed permanently', [
            'customer_id' => $this->customerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
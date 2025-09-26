<?php

namespace App\Jobs;

use App\Services\ERP\ERPManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncInvoices implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];
    public $timeout = 120;

    public function __construct(
        public string $customerId,
        public array $filters = []
    ) {}

    public function handle(ERPManager $erpManager): void
    {
        try {
            $erp = $erpManager->driver();
            $invoices = $erp->getCustomerInvoices($this->customerId, $this->filters);

            $cacheKey = "invoices:{$this->customerId}:" . md5(json_encode($this->filters));
            Cache::put($cacheKey, $invoices, 300);

            Log::info('Invoices synced successfully', [
                'customer_id' => $this->customerId,
                'count' => $invoices->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to sync invoices', [
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
        Log::error('Invoice sync job failed permanently', [
            'customer_id' => $this->customerId,
            'error' => $exception->getMessage(),
        ]);
    }
}
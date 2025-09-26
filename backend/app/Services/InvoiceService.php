<?php

namespace App\Services;

use App\Models\User;
use App\Services\ERP\ERPManager;
use App\Services\ERP\DataTransferObjects\InvoiceDTO;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class InvoiceService
{
    private ERPManager $erpManager;

    public function __construct(ERPManager $erpManager)
    {
        $this->erpManager = $erpManager;
    }

    public function getCustomerInvoices(User $user, array $filters = []): Collection
    {
        if (!$user->customer_id) {
            return collect();
        }

        $cacheKey = "invoices:{$user->customer_id}:" . md5(json_encode($filters));

        return Cache::remember($cacheKey, 300, function () use ($user, $filters) {
            try {
                $erp = $this->erpManager->driver();
                return $erp->getCustomerInvoices($user->customer_id, $filters);
            } catch (\Exception $e) {
                Log::error('Failed to fetch customer invoices', [
                    'user_id' => $user->id,
                    'customer_id' => $user->customer_id,
                    'filters' => $filters,
                    'error' => $e->getMessage(),
                ]);
                return collect();
            }
        });
    }

    public function getInvoice(string $invoiceId): ?InvoiceDTO
    {
        $cacheKey = "invoice:{$invoiceId}";

        return Cache::remember($cacheKey, 300, function () use ($invoiceId) {
            try {
                $erp = $this->erpManager->driver();
                return $erp->getInvoice($invoiceId);
            } catch (\Exception $e) {
                Log::error('Failed to fetch invoice', [
                    'invoice_id' => $invoiceId,
                    'error' => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    public function getInvoicePDF(string $invoiceId): ?string
    {
        try {
            $erp = $this->erpManager->driver();
            return $erp->getInvoicePDF($invoiceId);
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoice PDF', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function getUnpaidInvoices(User $user): Collection
    {
        return $this->getCustomerInvoices($user, ['status' => 'unpaid']);
    }

    public function getTotalOutstanding(User $user): float
    {
        $invoices = $this->getUnpaidInvoices($user);
        return $invoices->sum('outstanding');
    }

    public function getConsumptionHistory(User $user, int $months = 12): array
    {
        $invoices = $this->getCustomerInvoices($user);

        $history = $invoices
            ->filter(fn($invoice) => $invoice->readingDate !== null)
            ->sortByDesc(fn($invoice) => $invoice->readingDate->getTimestamp())
            ->take($months)
            ->map(fn($invoice) => [
                'month' => $invoice->readingDate->format('Y-m'),
                'kwh_consumed' => $invoice->kwhConsumed,
                'volume_m3' => $invoice->volumeM3,
                'gcal_equivalent' => $invoice->gcalEquivalent,
                'amount' => $invoice->amount,
            ])
            ->values()
            ->toArray();

        return array_reverse($history);
    }

    public function refreshInvoiceCache(string $customerId): void
    {
        $pattern = "invoices:{$customerId}:*";
        Cache::flush();
    }
}
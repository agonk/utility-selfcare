<?php

namespace App\Services;

use App\Models\User;
use App\Services\ERP\ERPManager;
use App\Services\ERP\DataTransferObjects\CustomerDTO;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CustomerService
{
    private ERPManager $erpManager;

    public function __construct(ERPManager $erpManager)
    {
        $this->erpManager = $erpManager;
    }

    public function getCustomerData(User $user): ?CustomerDTO
    {
        if (!$user->customer_id) {
            return null;
        }

        $cacheKey = "customer:{$user->customer_id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            try {
                $erp = $this->erpManager->driver();
                return $erp->getCustomer($user->customer_id);
            } catch (\Exception $e) {
                Log::error('Failed to fetch customer data', [
                    'user_id' => $user->id,
                    'customer_id' => $user->customer_id,
                    'error' => $e->getMessage(),
                ]);
                return null;
            }
        });
    }

    public function getCustomerBalance(User $user): float
    {
        $customer = $this->getCustomerData($user);
        return $customer?->balance ?? 0.0;
    }

    public function linkCustomerToUser(User $user, string $customerId): bool
    {
        try {
            $erp = $this->erpManager->driver();
            $customer = $erp->getCustomer($customerId);

            if (!$customer) {
                Log::warning('Attempted to link non-existent customer', [
                    'user_id' => $user->id,
                    'customer_id' => $customerId,
                ]);
                return false;
            }

            $user->customer_id = $customerId;
            $user->save();

            Cache::forget("customer:{$customerId}");

            Log::info('Customer linked to user', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to link customer to user', [
                'user_id' => $user->id,
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function searchCustomers(string $query): array
    {
        try {
            $erp = $this->erpManager->driver();
            $customers = $erp->searchCustomers($query);

            return $customers->map(function (CustomerDTO $customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'balance' => $customer->balance,
                    'status' => $customer->status,
                ];
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Failed to search customers', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function refreshCustomerCache(string $customerId): void
    {
        Cache::forget("customer:{$customerId}");
    }
}
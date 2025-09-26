<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\CustomerService;
use App\Services\ERP\ERPManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class CustomerServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CustomerService $customerService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->customerService = app(CustomerService::class);
        config(['erp.default' => 'mock']);
    }

    public function test_gets_customer_data_for_linked_user(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $customer = $this->customerService->getCustomerData($user);

        $this->assertNotNull($customer);
        $this->assertEquals('CUST-001', $customer->id);
        $this->assertEquals('Mock Heat Customer', $customer->name);
    }

    public function test_returns_null_for_user_without_customer(): void
    {
        $user = User::factory()->create(['customer_id' => null]);

        $customer = $this->customerService->getCustomerData($user);

        $this->assertNull($customer);
    }

    public function test_caches_customer_data(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $this->customerService->getCustomerData($user);

        $this->assertTrue(Cache::has("customer:CUST-001"));
    }

    public function test_gets_customer_balance(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $balance = $this->customerService->getCustomerBalance($user);

        $this->assertEquals(150.50, $balance);
    }

    public function test_links_customer_to_user(): void
    {
        $user = User::factory()->create(['customer_id' => null]);

        $result = $this->customerService->linkCustomerToUser($user, 'CUST-001');

        $this->assertTrue($result);
        $this->assertEquals('CUST-001', $user->fresh()->customer_id);
    }

    public function test_searches_customers(): void
    {
        $results = $this->customerService->searchCustomers('mock');

        $this->assertIsArray($results);
        $this->assertCount(2, $results);
        $this->assertEquals('CUST-001', $results[0]['id']);
    }

    public function test_refreshes_customer_cache(): void
    {
        Cache::put('customer:CUST-001', 'test', 300);

        $this->customerService->refreshCustomerCache('CUST-001');

        $this->assertFalse(Cache::has('customer:CUST-001'));
    }
}
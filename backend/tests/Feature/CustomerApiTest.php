<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['erp.default' => 'mock']);
    }

    public function test_get_customer_data(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer');

        $response->assertOk()
            ->assertJsonStructure([
                'id',
                'name',
                'address',
                'heatmeter_id',
                'balance',
                'status',
            ]);
    }

    public function test_returns_404_when_no_customer_linked(): void
    {
        $user = User::factory()->create(['customer_id' => null]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer');

        $response->assertNotFound();
    }

    public function test_get_customer_balance(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer/balance');

        $response->assertOk()
            ->assertJsonStructure(['balance'])
            ->assertJson(['balance' => 150.50]);
    }

    public function test_search_customers(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/customer/search?query=mock');

        $response->assertOk()
            ->assertJsonStructure([
                'customers' => [
                    '*' => ['id', 'name', 'balance', 'status']
                ]
            ]);
    }

    public function test_link_customer_to_user(): void
    {
        $user = User::factory()->create(['customer_id' => null]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/customer/link', [
            'customer_id' => 'CUST-001'
        ]);

        $response->assertOk()
            ->assertJson(['message' => 'Customer linked successfully']);

        $this->assertEquals('CUST-001', $user->fresh()->customer_id);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/customer');

        $response->assertUnauthorized();
    }
}
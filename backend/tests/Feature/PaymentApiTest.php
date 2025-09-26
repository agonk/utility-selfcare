<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['erp.default' => 'mock']);
    }

    public function test_create_payment(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'invoice_id' => 'INV-001',
            'amount' => 50.00,
            'payment_method' => 'Card'
        ]);

        $response->assertCreated()
            ->assertJson(['message' => 'Payment created successfully']);
    }

    public function test_validation_on_payment_creation(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/payments', [
            'amount' => 50.00
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['invoice_id']);
    }

    public function test_get_payment_history(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/payments');

        $response->assertOk()
            ->assertJsonStructure(['payments']);
    }

    public function test_get_payment_status(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/payments/PAY-001/status');

        $response->assertOk()
            ->assertJsonStructure([
                'payment_id',
                'status'
            ]);
    }

    public function test_requires_authentication(): void
    {
        $response = $this->postJson('/api/payments', [
            'invoice_id' => 'INV-001',
            'amount' => 50.00
        ]);

        $response->assertUnauthorized();
    }
}
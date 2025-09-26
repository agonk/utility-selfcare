<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvoiceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['erp.default' => 'mock']);
    }

    public function test_get_invoices(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/invoices');

        $response->assertOk()
            ->assertJsonStructure([
                'invoices' => [
                    '*' => [
                        'id',
                        'customer_id',
                        'date',
                        'due_date',
                        'amount',
                        'paid',
                        'outstanding',
                        'status',
                        'kwh_consumed',
                        'volume_m3',
                        'gcal_equivalent',
                        'reading_date',
                    ]
                ]
            ]);
    }

    public function test_get_single_invoice(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/invoices/INV-001');

        $response->assertOk()
            ->assertJsonPath('invoice.id', 'INV-001');
    }

    public function test_cannot_access_other_customer_invoice(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-999']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/invoices/INV-001');

        $response->assertForbidden();
    }

    public function test_get_unpaid_invoices(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/invoices/unpaid');

        $response->assertOk()
            ->assertJsonStructure([
                'invoices',
                'total_outstanding'
            ]);
    }

    public function test_get_consumption_history(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/invoices/consumption?months=6');

        $response->assertOk()
            ->assertJsonStructure([
                'consumption_history' => [
                    '*' => [
                        'month',
                        'kwh_consumed',
                        'volume_m3',
                        'gcal_equivalent',
                        'amount'
                    ]
                ]
            ]);
    }

    public function test_download_invoice_pdf(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);
        Sanctum::actingAs($user);

        $response = $this->get('/api/invoices/INV-001/pdf');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/invoices');

        $response->assertUnauthorized();
    }
}
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\InvoiceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class InvoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InvoiceService $invoiceService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->invoiceService = app(InvoiceService::class);
        config(['erp.default' => 'mock']);
    }

    public function test_gets_customer_invoices(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $invoices = $this->invoiceService->getCustomerInvoices($user);

        $this->assertCount(2, $invoices);
        $this->assertEquals('INV-001', $invoices[0]->id);
    }

    public function test_returns_empty_for_user_without_customer(): void
    {
        $user = User::factory()->create(['customer_id' => null]);

        $invoices = $this->invoiceService->getCustomerInvoices($user);

        $this->assertCount(0, $invoices);
    }

    public function test_filters_unpaid_invoices(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $invoices = $this->invoiceService->getUnpaidInvoices($user);

        $this->assertGreaterThan(0, $invoices->count());
        $this->assertEquals('unpaid', $invoices->first()->status);
    }

    public function test_gets_single_invoice(): void
    {
        $invoice = $this->invoiceService->getInvoice('INV-001');

        $this->assertNotNull($invoice);
        $this->assertEquals('INV-001', $invoice->id);
        $this->assertEquals(450.5, $invoice->kwhConsumed);
    }

    public function test_gets_total_outstanding(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $total = $this->invoiceService->getTotalOutstanding($user);

        $this->assertEquals(75.50, $total);
    }

    public function test_gets_consumption_history(): void
    {
        $user = User::factory()->create(['customer_id' => 'CUST-001']);

        $history = $this->invoiceService->getConsumptionHistory($user, 12);

        $this->assertIsArray($history);
        $this->assertArrayHasKey('kwh_consumed', $history[0]);
        $this->assertArrayHasKey('volume_m3', $history[0]);
    }

    public function test_gets_invoice_pdf(): void
    {
        $pdf = $this->invoiceService->getInvoicePDF('INV-001');

        $this->assertNotNull($pdf);
        $this->assertStringContainsString('Mock PDF content', $pdf);
    }
}
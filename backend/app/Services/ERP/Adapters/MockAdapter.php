<?php

namespace App\Services\ERP\Adapters;

use App\Services\ERP\Contracts\ERPInterface;
use App\Services\ERP\DataTransferObjects\CustomerDTO;
use App\Services\ERP\DataTransferObjects\InvoiceDTO;
use App\Services\ERP\DataTransferObjects\PaymentDTO;
use Illuminate\Support\Collection;
use DateTime;

class MockAdapter implements ERPInterface
{
    public function authenticate(): bool
    {
        return true;
    }

    public function isAuthenticated(): bool
    {
        return true;
    }

    public function getCustomer(string $customerId): ?CustomerDTO
    {
        return new CustomerDTO(
            id: $customerId,
            name: 'Mock Heat Customer',
            address: 'Main St. 42, Pristina',
            heatmeterId: 'HM-' . substr($customerId, -3),
            balance: 150.50,
            status: 'active'
        );
    }

    public function getCustomerBalance(string $customerId): float
    {
        return 150.50;
    }

    public function searchCustomers(string $query): Collection
    {
        return collect([
            $this->getCustomer('CUST-001'),
            $this->getCustomer('CUST-002'),
        ]);
    }

    public function getCustomerInvoices(string $customerId, array $filters = []): Collection
    {
        return collect([
            new InvoiceDTO(
                id: 'INV-001',
                customerId: $customerId,
                date: new DateTime('2025-01-01'),
                dueDate: new DateTime('2025-01-15'),
                amount: 75.50,
                paid: 0,
                outstanding: 75.50,
                status: 'unpaid',
                kwhConsumed: 450.5,
                volumeM3: 15.2,
                gcalEquivalent: 0.388,
                readingDate: new DateTime('2024-12-31')
            ),
            new InvoiceDTO(
                id: 'INV-002',
                customerId: $customerId,
                date: new DateTime('2024-12-01'),
                dueDate: new DateTime('2024-12-15'),
                amount: 85.00,
                paid: 85.00,
                outstanding: 0,
                status: 'paid',
                kwhConsumed: 520.0,
                volumeM3: 17.5,
                gcalEquivalent: 0.448,
                readingDate: new DateTime('2024-11-30')
            ),
        ]);
    }

    public function getInvoice(string $invoiceId): ?InvoiceDTO
    {
        return new InvoiceDTO(
            id: $invoiceId,
            customerId: 'CUST-001',
            date: new DateTime('2025-01-01'),
            dueDate: new DateTime('2025-01-15'),
            amount: 75.50,
            paid: 0,
            outstanding: 75.50,
            status: 'unpaid',
            kwhConsumed: 450.5,
            volumeM3: 15.2,
            gcalEquivalent: 0.388,
            readingDate: new DateTime('2024-12-31')
        );
    }

    public function getInvoicePDF(string $invoiceId): ?string
    {
        return 'Mock PDF content for ' . $invoiceId;
    }

    public function createPayment(PaymentDTO $payment): bool
    {
        return true;
    }

    public function getPaymentStatus(string $paymentId): ?string
    {
        return 'submitted';
    }

    public function getPaymentHistory(string $customerId): Collection
    {
        return collect([
            [
                'name' => 'PAY-001',
                'posting_date' => '2024-12-15',
                'paid_amount' => 85.00,
                'reference_no' => 'SELFCARE-001',
            ],
        ]);
    }

    public function syncCustomerData(string $customerId): bool
    {
        return true;
    }
}
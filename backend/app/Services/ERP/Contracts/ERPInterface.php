<?php

namespace App\Services\ERP\Contracts;

use Illuminate\Support\Collection;
use App\Services\ERP\DataTransferObjects\CustomerDTO;
use App\Services\ERP\DataTransferObjects\InvoiceDTO;
use App\Services\ERP\DataTransferObjects\PaymentDTO;

interface ERPInterface
{
    public function authenticate(): bool;

    public function isAuthenticated(): bool;

    public function getCustomer(string $customerId): ?CustomerDTO;

    public function getCustomerBalance(string $customerId): float;

    public function searchCustomers(string $query): Collection;

    public function getCustomerInvoices(string $customerId, array $filters = []): Collection;

    public function getInvoice(string $invoiceId): ?InvoiceDTO;

    public function getInvoicePDF(string $invoiceId): ?string;

    public function createPayment(PaymentDTO $payment): bool;

    public function getPaymentStatus(string $paymentId): ?string;

    public function getPaymentHistory(string $customerId): Collection;

    public function syncCustomerData(string $customerId): bool;
}
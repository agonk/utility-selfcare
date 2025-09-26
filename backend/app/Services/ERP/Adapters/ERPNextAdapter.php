<?php

namespace App\Services\ERP\Adapters;

use App\Services\ERP\Contracts\ERPInterface;
use App\Services\ERP\DataTransferObjects\CustomerDTO;
use App\Services\ERP\DataTransferObjects\InvoiceDTO;
use App\Services\ERP\DataTransferObjects\PaymentDTO;
use GuzzleHttp\Client;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class ERPNextAdapter implements ERPInterface
{
    private Client $client;
    private string $url;
    private string $apiKey;
    private string $apiSecret;
    private bool $authenticated = false;

    public function __construct(array $config)
    {
        $this->url = rtrim($config['url'], '/');
        $this->apiKey = $config['api_key'];
        $this->apiSecret = $config['api_secret'];

        $this->client = new Client([
            'base_uri' => $this->url,
            'timeout' => $config['timeout'] ?? 30,
            'headers' => [
                'Authorization' => 'token ' . $this->apiKey . ':' . $this->apiSecret,
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ],
        ]);
    }

    public function authenticate(): bool
    {
        try {
            $response = $this->client->get('/api/method/frappe.auth.get_logged_user');
            $this->authenticated = $response->getStatusCode() === 200;
            return $this->authenticated;
        } catch (\Exception $e) {
            Log::error('ERPNext authentication failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function isAuthenticated(): bool
    {
        return $this->authenticated;
    }

    public function getCustomer(string $customerId): ?CustomerDTO
    {
        try {
            $response = $this->client->get("/api/resource/Customer/{$customerId}");
            $data = json_decode($response->getBody()->getContents(), true);

            return CustomerDTO::fromERPNext($data['data'] ?? $data);
        } catch (\Exception $e) {
            Log::error('Failed to fetch customer from ERPNext', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function getCustomerBalance(string $customerId): float
    {
        $customer = $this->getCustomer($customerId);
        return $customer?->balance ?? 0.0;
    }

    public function searchCustomers(string $query): Collection
    {
        try {
            $response = $this->client->get('/api/resource/Customer', [
                'query' => [
                    'fields' => json_encode(['name', 'customer_name', 'outstanding_amount']),
                    'filters' => json_encode([['customer_name', 'like', "%{$query}%"]]),
                    'limit_page_length' => 20,
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return collect($data['data'] ?? [])->map(fn($customer) =>
                CustomerDTO::fromERPNext($customer)
            );
        } catch (\Exception $e) {
            Log::error('Failed to search customers', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    public function getCustomerInvoices(string $customerId, array $filters = []): Collection
    {
        try {
            $erpFilters = [['customer', '=', $customerId]];

            if (isset($filters['status'])) {
                $erpFilters[] = ['status', '=', ucfirst($filters['status'])];
            }

            $response = $this->client->get('/api/resource/Sales Invoice', [
                'query' => [
                    'fields' => json_encode(['*']),
                    'filters' => json_encode($erpFilters),
                    'limit_page_length' => $filters['limit'] ?? 100,
                    'order_by' => 'posting_date desc',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return collect($data['data'] ?? [])->map(fn($invoice) =>
                InvoiceDTO::fromERPNext($invoice)
            );
        } catch (\Exception $e) {
            Log::error('Failed to fetch customer invoices', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    public function getInvoice(string $invoiceId): ?InvoiceDTO
    {
        try {
            $response = $this->client->get("/api/resource/Sales Invoice/{$invoiceId}");
            $data = json_decode($response->getBody()->getContents(), true);

            return InvoiceDTO::fromERPNext($data['data'] ?? $data);
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoice from ERPNext', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function getInvoicePDF(string $invoiceId): ?string
    {
        try {
            $response = $this->client->get("/api/method/frappe.utils.print_format.download_pdf", [
                'query' => [
                    'doctype' => 'Sales Invoice',
                    'name' => $invoiceId,
                    'format' => 'Standard',
                ],
            ]);

            return $response->getBody()->getContents();
        } catch (\Exception $e) {
            Log::error('Failed to fetch invoice PDF', [
                'invoice_id' => $invoiceId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function createPayment(PaymentDTO $payment): bool
    {
        try {
            $response = $this->client->post('/api/resource/Payment Entry', [
                'json' => [
                    'payment_type' => 'Receive',
                    'party_type' => 'Customer',
                    'party' => $payment->customerId,
                    'paid_amount' => $payment->amount,
                    'received_amount' => $payment->amount,
                    'posting_date' => $payment->paymentDate->format('Y-m-d'),
                    'reference_no' => $payment->reference,
                    'reference_date' => $payment->paymentDate->format('Y-m-d'),
                    'mode_of_payment' => $payment->paymentMethod,
                    'references' => [
                        [
                            'reference_doctype' => 'Sales Invoice',
                            'reference_name' => $payment->invoiceId,
                            'allocated_amount' => $payment->amount,
                        ],
                    ],
                ],
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error('Failed to create payment in ERPNext', [
                'payment' => $payment->toArray(),
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function getPaymentStatus(string $paymentId): ?string
    {
        try {
            $response = $this->client->get("/api/resource/Payment Entry/{$paymentId}");
            $data = json_decode($response->getBody()->getContents(), true);

            return $data['data']['docstatus'] ?? null;
        } catch (\Exception $e) {
            Log::error('Failed to get payment status', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function getPaymentHistory(string $customerId): Collection
    {
        try {
            $response = $this->client->get('/api/resource/Payment Entry', [
                'query' => [
                    'fields' => json_encode(['*']),
                    'filters' => json_encode([
                        ['party', '=', $customerId],
                        ['payment_type', '=', 'Receive'],
                    ]),
                    'order_by' => 'posting_date desc',
                ],
            ]);

            $data = json_decode($response->getBody()->getContents(), true);

            return collect($data['data'] ?? []);
        } catch (\Exception $e) {
            Log::error('Failed to fetch payment history', [
                'customer_id' => $customerId,
                'error' => $e->getMessage(),
            ]);
            return collect();
        }
    }

    public function syncCustomerData(string $customerId): bool
    {
        $customer = $this->getCustomer($customerId);
        return $customer !== null;
    }
}
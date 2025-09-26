# ERP Integration Documentation

## Overview

Selfcare uses an **adapter pattern** to integrate with various ERP systems. This architecture enables switching between different ERPs (ERPNext, SAP, Odoo) or even custom utility APIs without changing the application code.

## Implementation Philosophy: Pragmatic, Not Premature

**Phase 4 (Current):** Heat-specific implementation for Termokos
- InvoiceDTO contains heat-specific fields (kWh, m³)
- Charts optimized for heat consumption visualization
- ERPNext adapter tailored for heat utility requirements

**Future (When Utility #2 Signs):** Extract common patterns
- Refactor based on REAL requirements from second utility
- Build abstraction when we have TWO concrete examples
- Avoid over-engineering for hypothetical scenarios

**Why this approach?**
- Ship faster with clear, simple code
- Avoid wrong abstractions based on guesses
- Refactor with confidence when patterns are proven

## Core Architecture Principle

**Customer-Centric Model**: All integrations use Customer ID as the primary key, NOT meter/device IDs.

### Why Customer, Not Meter?

1. **ERP Native**: All ERPs organize data around customers
2. **API Compatibility**: `/api/resource/Customer/{id}` exists in most ERPs
3. **Permissions**: ERP role-based access works at customer level
4. **Scalability**: One customer can have multiple meters/services
5. **No Custom Code**: Avoids ERP modifications

## Multi-User Architecture

```
Traditional ERP Model (Wrong for Utilities):
Customer Account → Single Login

Our Model (Reality-Based):
Customer Account → Multiple Selfcare Users

Example:
CUST-001 (Apartment at Main St. 42)
├── John (Dad) - Selfcare User
├── Mary (Mom) - Selfcare User
├── Alex (Adult Son) - Selfcare User
└── Landlord - Also has access to CUST-002, CUST-003
```

**Key Point**: Selfcare owns user↔customer relationships. ERP remains unaware of individual users.

## Directory Structure

```
app/Services/ERP/
├── Contracts/
│   └── ERPInterface.php           # The contract ALL adapters must implement
├── Adapters/
│   ├── ERPNextAdapter.php         # ERPNext/Frappe implementation
│   ├── MockAdapter.php            # For testing and development
│   ├── SAPAdapter.php             # Future: SAP integration
│   └── OdooAdapter.php            # Future: Odoo integration
├── DataTransferObjects/
│   ├── CustomerDTO.php            # Normalized customer data
│   ├── InvoiceDTO.php             # Normalized invoice data
│   └── PaymentDTO.php             # Normalized payment data
├── ERPManager.php                 # Factory/resolver for adapters
└── config/erp.php                 # Configuration file
```

## The Contract (ERPInterface)

Every ERP adapter MUST implement this interface:

```php
interface ERPInterface
{
    // Authentication
    public function authenticate(): bool;
    public function isAuthenticated(): bool;

    // Customer Operations
    public function getCustomer(string $customerId): ?CustomerDTO;
    public function getCustomerBalance(string $customerId): float;
    public function searchCustomers(string $query): Collection;

    // Invoice Operations
    public function getCustomerInvoices(string $customerId, array $filters = []): Collection;
    public function getInvoice(string $invoiceId): ?InvoiceDTO;
    public function getInvoicePDF(string $invoiceId): ?string;

    // Payment Operations
    public function createPayment(PaymentDTO $payment): bool;
    public function getPaymentStatus(string $paymentId): ?string;
    public function getPaymentHistory(string $customerId): Collection;

    // Sync Operations
    public function syncCustomerData(string $customerId): bool;
    public function getLastSyncTime(): ?Carbon;
}
```

## Data Transfer Objects (DTOs)

DTOs normalize data from different ERPs into consistent structures:

### CustomerDTO
```php
class CustomerDTO
{
    public string $id;              // ERP customer ID (e.g., "CUST-001")
    public string $name;            // Customer name
    public string $address;         // Service address
    public ?string $heatmeterId;    // Meter ID (for display only)
    public float $balance;          // Current balance
    public string $status;          // active|inactive|suspended
    public array $metadata = [];    // ERP-specific extra data

    // Factory methods for each ERP
    public static function fromERPNext(array $data): self
    {
        return new self([
            'id' => $data['name'],
            'name' => $data['customer_name'],
            'address' => $data['primary_address'],
            'heatmeterId' => $data['custom_heatmeter_id'] ?? null,
            'balance' => $data['outstanding_amount'] ?? 0,
            'status' => $data['disabled'] ? 'inactive' : 'active'
        ]);
    }

    public static function fromSAP(array $data): self
    {
        // SAP-specific mapping
    }
}
```

### InvoiceDTO (Heat-Specific - Phase 4)
```php
class InvoiceDTO
{
    // Generic fields (work for all utilities)
    public string $id;               // Invoice number
    public string $customerId;      // Customer ID reference
    public DateTime $date;           // Invoice date
    public DateTime $dueDate;        // Due date
    public float $amount;            // Total amount
    public float $paid;              // Amount paid
    public float $outstanding;       // Balance due
    public string $status;           // draft|unpaid|paid|overdue

    // Heat-specific fields (Termokos)
    public float $kwhConsumed;       // Energy consumption in kWh
    public float $volumeM3;          // Volume consumed in m³
    public ?float $gcalEquivalent;   // Gigacalories (optional)
    public ?DateTime $readingDate;   // Meter reading date

    // For ERP debugging
    public array $rawERPData = [];   // Original ERP response

    // Future: When adding water/electric
    // Create WaterInvoiceDTO, ElectricInvoiceDTO
    // OR refactor to use measurements: Collection<MeasurementDTO>
}
```

## Configuration

### Environment Variables (.env)
```env
# Provider selection
ERP_PROVIDER=erpnext    # Options: erpnext, sap, odoo, mock, custom

# ERPNext Configuration
ERPNEXT_URL=https://erp.termokos.com
ERPNEXT_API_KEY=abc123
ERPNEXT_API_SECRET=xyz789
ERPNEXT_TIMEOUT=30

# SAP Configuration (Future)
SAP_URL=https://sap.utility.com
SAP_CLIENT=100
SAP_USERNAME=apiuser
SAP_PASSWORD=secret

# Mock Configuration (Development)
MOCK_DATA_PATH=storage/app/mock/erp
```

### Config File (config/erp.php)
```php
return [
    'default' => env('ERP_PROVIDER', 'mock'),

    'providers' => [
        'erpnext' => [
            'adapter' => ERPNextAdapter::class,
            'url' => env('ERPNEXT_URL'),
            'api_key' => env('ERPNEXT_API_KEY'),
            'api_secret' => env('ERPNEXT_API_SECRET'),
            'timeout' => env('ERPNEXT_TIMEOUT', 30),
        ],
        'mock' => [
            'adapter' => MockAdapter::class,
            'data_path' => env('MOCK_DATA_PATH'),
        ],
    ],
];
```

## Usage Examples

### In Controllers
```php
class InvoiceController extends Controller
{
    public function __construct(
        private ERPManager $erpManager
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $erp = $this->erpManager->driver();

        // Get all invoices for user's customers
        $invoices = collect();
        foreach ($user->customers as $customer) {
            $customerInvoices = $erp->getCustomerInvoices($customer->customer_id);
            $invoices = $invoices->merge($customerInvoices);
        }

        return InvoiceResource::collection($invoices);
    }
}
```

### In Services
```php
class PaymentService
{
    public function processPayment(User $user, string $invoiceId, float $amount)
    {
        $erp = app(ERPManager::class)->driver();

        // Get invoice
        $invoice = $erp->getInvoice($invoiceId);

        // Create payment DTO
        $payment = new PaymentDTO([
            'customer_id' => $invoice->customerId,
            'invoice_id' => $invoiceId,
            'amount' => $amount,
            'payment_date' => now(),
            'reference' => 'SELFCARE-' . Str::random(8),
        ]);

        // Post to ERP
        if ($erp->createPayment($payment)) {
            // Log success
            return true;
        }

        return false;
    }
}
```

## Adding a New ERP

To add support for a new ERP system:

### 1. Create the Adapter
```php
namespace App\Services\ERP\Adapters;

class SAPAdapter implements ERPInterface
{
    public function authenticate(): bool
    {
        // SAP-specific authentication
    }

    public function getCustomer(string $customerId): ?CustomerDTO
    {
        // Fetch from SAP
        $sapCustomer = $this->client->get("/customers/{$customerId}");

        // Convert to DTO
        return CustomerDTO::fromSAP($sapCustomer);
    }

    // Implement all other interface methods...
}
```

### 2. Add Configuration
```php
// In config/erp.php
'sap' => [
    'adapter' => SAPAdapter::class,
    'url' => env('SAP_URL'),
    // ... other SAP config
],
```

### 3. Add DTO Factory Method
```php
// In CustomerDTO
public static function fromSAP(array $data): self
{
    return new self([
        'id' => $data['CustomerNumber'],
        'name' => $data['Name1'],
        // ... map SAP fields
    ]);
}
```

### 4. Test
```php
public function test_sap_adapter_implements_interface()
{
    $adapter = new SAPAdapter();
    $this->assertInstanceOf(ERPInterface::class, $adapter);
}
```

## Testing Strategy

### Unit Tests
```php
public function test_can_switch_erp_providers()
{
    config(['erp.default' => 'mock']);
    $erp = app(ERPManager::class)->driver();
    $this->assertInstanceOf(MockAdapter::class, $erp);

    config(['erp.default' => 'erpnext']);
    $erp = app(ERPManager::class)->driver();
    $this->assertInstanceOf(ERPNextAdapter::class, $erp);
}
```

### Feature Tests
```php
public function test_user_can_view_invoices()
{
    // Always uses mock in testing
    $user = User::factory()->withCustomer('CUST-001')->create();

    $response = $this->actingAs($user)->getJson('/api/invoices');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'amount', 'due_date', 'status']
            ]
        ]);
}
```

## Migration Path

When switching from one ERP to another:

1. **Update .env**: Change `ERP_PROVIDER`
2. **Run sync**: `php artisan erp:sync-all-customers`
3. **Verify**: `php artisan erp:verify-connection`
4. **Monitor**: Check logs for adapter-specific errors

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check API credentials in .env
   - Verify ERP user has correct permissions
   - Check network connectivity

2. **Data Mapping Errors**
   - Review DTO factory methods
   - Check for null/missing fields
   - Add defensive checks in adapters

3. **Performance Issues**
   - Implement caching in adapters
   - Use queue jobs for sync operations
   - Batch API requests where possible

## Future Considerations

### Multi-Tenant Architecture
```env
# Per-utility configuration (future)
TERMOKOS_ERP_PROVIDER=erpnext
TERMOKOS_ERPNEXT_URL=https://erp.termokos.com

WATERCO_ERP_PROVIDER=sap
WATERCO_SAP_URL=https://sap.waterco.com
```

### Webhook Support
Future adapters may support webhooks for real-time updates:
- Invoice created
- Payment received
- Customer updated

### API Rate Limiting
Implement rate limiting per adapter to respect ERP API limits.

---

## Phase 4 Implementation Plan (Start to Finish)

### Step 1: Database Migration (user_heatmeters → user_customers)
```bash
php artisan make:migration refactor_user_heatmeters_to_customers
```

**Migration:**
```php
// Add customer_id column
Schema::table('user_heatmeters', function (Blueprint $table) {
    $table->string('customer_id')->nullable()->after('id');
    $table->index('customer_id');
});

// Later: rename table
Schema::rename('user_heatmeters', 'user_customers');
```

### Step 2: Create ERP Foundation
```
app/Services/ERP/
├── Contracts/ERPInterface.php         # Create interface
├── DataTransferObjects/
│   ├── CustomerDTO.php                 # Generic customer
│   └── InvoiceDTO.php                  # Heat-specific invoice
├── ERPManager.php                      # Factory class
└── config/erp.php                      # Configuration
```

### Step 3: Mock Adapter (Test First)
```php
// app/Services/ERP/Adapters/MockAdapter.php
class MockAdapter implements ERPInterface
{
    public function getCustomer(string $customerId): ?CustomerDTO
    {
        // Return fake heat customer
        return new CustomerDTO([
            'id' => $customerId,
            'name' => 'Test Heat Customer',
            'address' => 'Main St. 42, Pristina',
            'heatmeterId' => 'HM-001',
            'balance' => 150.00,
        ]);
    }

    public function getCustomerInvoices(string $customerId, array $filters = []): Collection
    {
        // Return fake heat invoices with kWh data
        return collect([
            new InvoiceDTO([
                'id' => 'INV-001',
                'customerId' => $customerId,
                'amount' => 75.00,
                'kwhConsumed' => 450.5,
                'volumeM3' => 15.2,
                'date' => now()->subMonth(),
                'dueDate' => now()->addDays(15),
            ]),
        ]);
    }
}
```

### Step 4: ERPNext Adapter (Real Implementation)
```php
// app/Services/ERP/Adapters/ERPNextAdapter.php
class ERPNextAdapter implements ERPInterface
{
    private FrappeClient $client;

    public function getCustomer(string $customerId): ?CustomerDTO
    {
        $response = $this->client->get("Customer", $customerId);

        return new CustomerDTO([
            'id' => $response['name'],
            'name' => $response['customer_name'],
            'address' => $response['primary_address'] ?? '',
            'heatmeterId' => $response['custom_heatmeter_id'] ?? null,
            'balance' => $response['outstanding_amount'] ?? 0,
        ]);
    }

    public function getCustomerInvoices(string $customerId, array $filters = []): Collection
    {
        $response = $this->client->getList("Sales Invoice", [
            'filters' => [['customer', '=', $customerId]],
            'fields' => ['*'],
        ]);

        return collect($response['data'])->map(function ($invoice) {
            return new InvoiceDTO([
                'id' => $invoice['name'],
                'customerId' => $invoice['customer'],
                'amount' => $invoice['grand_total'],
                'paid' => $invoice['paid_amount'],
                'outstanding' => $invoice['outstanding_amount'],
                'date' => new DateTime($invoice['posting_date']),
                'dueDate' => new DateTime($invoice['due_date']),
                'status' => $this->mapStatus($invoice['status']),

                // Heat-specific from ERPNext custom fields
                'kwhConsumed' => $invoice['custom_kwh_consumed'] ?? 0,
                'volumeM3' => $invoice['custom_volume_m3'] ?? 0,
                'gcalEquivalent' => $invoice['custom_gcal'] ?? null,
                'readingDate' => isset($invoice['custom_reading_date'])
                    ? new DateTime($invoice['custom_reading_date'])
                    : null,

                'rawERPData' => $invoice, // Keep for debugging
            ]);
        });
    }

    private function mapStatus(string $erpStatus): string
    {
        return match($erpStatus) {
            'Draft' => 'draft',
            'Unpaid', 'Overdue' => 'unpaid',
            'Paid' => 'paid',
            default => 'unknown',
        };
    }
}
```

### Step 5: Service Layer
```php
// app/Services/InvoiceService.php
class InvoiceService
{
    public function __construct(
        private ERPManager $erpManager
    ) {}

    public function getUserInvoices(User $user, array $filters = []): Collection
    {
        $erp = $this->erpManager->driver();

        return $user->customers->flatMap(function ($customer) use ($erp, $filters) {
            return $erp->getCustomerInvoices($customer->customer_id, $filters);
        });
    }

    public function getInvoiceDetails(string $invoiceId): ?InvoiceDTO
    {
        $erp = $this->erpManager->driver();
        return $erp->getInvoice($invoiceId);
    }
}
```

### Step 6: API Controller
```php
// app/Http/Controllers/Api/InvoiceController.php
class InvoiceController extends Controller
{
    public function index(Request $request, InvoiceService $invoiceService)
    {
        $invoices = $invoiceService->getUserInvoices($request->user());
        return InvoiceResource::collection($invoices);
    }

    public function show(string $id, InvoiceService $invoiceService)
    {
        $invoice = $invoiceService->getInvoiceDetails($id);

        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        return new InvoiceResource($invoice);
    }
}
```

### Step 7: API Resource (Transform DTO to JSON)
```php
// app/Http/Resources/InvoiceResource.php
class InvoiceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customerId,
            'date' => $this->date->format('Y-m-d'),
            'due_date' => $this->dueDate->format('Y-m-d'),
            'amount' => $this->amount,
            'paid' => $this->paid,
            'outstanding' => $this->outstanding,
            'status' => $this->status,

            // Heat-specific consumption data
            'consumption' => [
                'kwh' => $this->kwhConsumed,
                'volume_m3' => $this->volumeM3,
                'gcal' => $this->gcalEquivalent,
                'reading_date' => $this->readingDate?->format('Y-m-d'),
            ],
        ];
    }
}
```

### Step 8: Tests (TDD Approach)
```php
// tests/Unit/ERPNextAdapterTest.php
public function test_can_fetch_customer_from_erpnext()
{
    $adapter = app(ERPNextAdapter::class);
    $customer = $adapter->getCustomer('CUST-001');

    $this->assertInstanceOf(CustomerDTO::class, $customer);
    $this->assertEquals('CUST-001', $customer->id);
}

// tests/Feature/InvoiceApiTest.php
public function test_user_can_view_their_invoices()
{
    // Uses MockAdapter automatically
    $user = User::factory()->withCustomer('CUST-001')->create();

    $response = $this->actingAs($user)->getJson('/api/invoices');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id', 'amount', 'status',
                    'consumption' => ['kwh', 'volume_m3']
                ]
            ]
        ]);
}
```

### Step 9: Configuration
```env
# Development (uses mock)
ERP_PROVIDER=mock

# Production (uses ERPNext)
ERP_PROVIDER=erpnext
ERPNEXT_URL=https://erp.termokos.com
ERPNEXT_API_KEY=your-api-key
ERPNEXT_API_SECRET=your-secret
```

### Step 10: Routes
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/customers', [CustomerController::class, 'index']);
});
```

### Implementation Order

1. ✅ **Database migration** - Update user_heatmeters
2. ✅ **ERP interface** - Define contract
3. ✅ **DTOs** - CustomerDTO, InvoiceDTO (heat-specific)
4. ✅ **MockAdapter** - For testing
5. ✅ **ERPManager** - Factory pattern
6. ✅ **Tests** - Write tests using MockAdapter
7. ✅ **ERPNextAdapter** - Real implementation
8. ✅ **Service layer** - InvoiceService
9. ✅ **API endpoints** - Controllers + Resources
10. ✅ **Integration tests** - Full flow

### What NOT to Build Yet

❌ Generic measurement abstraction
❌ Unit conversion system (kWh ↔ Gcal)
❌ Multi-utility charts
❌ Config-driven UI components

**Build these when you have a second utility signed.**

---

**Remember**: The ERP is just a data source. Selfcare owns the user experience and relationships.
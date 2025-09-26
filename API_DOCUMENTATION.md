# API Documentation - ERP Integration

Base URL: `http://localhost:8000/api`

All authenticated endpoints require the `Authorization: Bearer {token}` header.

---

## Customer Endpoints

### Get Customer Data
```
GET /customer
```

**Response:**
```json
{
  "id": "CUST-001",
  "name": "John Doe Heat Customer",
  "address": "Main St. 42, Pristina",
  "heatmeter_id": "HM-001",
  "balance": 150.50,
  "status": "active"
}
```

### Get Customer Balance
```
GET /customer/balance
```

**Response:**
```json
{
  "balance": 150.50
}
```

### Search Customers
```
GET /customer/search?query={searchTerm}
```

**Response:**
```json
{
  "customers": [
    {
      "id": "CUST-001",
      "name": "John Doe",
      "balance": 150.50,
      "status": "active"
    }
  ]
}
```

### Link Customer to User
```
POST /customer/link
```

**Body:**
```json
{
  "customer_id": "CUST-001"
}
```

**Response:**
```json
{
  "message": "Customer linked successfully"
}
```

---

## Invoice Endpoints

### List Invoices
```
GET /invoices?status={unpaid|paid}
```

**Response:**
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "customer_id": "CUST-001",
      "date": "2025-01-01",
      "due_date": "2025-01-15",
      "amount": 75.50,
      "paid": 0,
      "outstanding": 75.50,
      "status": "unpaid",
      "kwh_consumed": 450.5,
      "volume_m3": 15.2,
      "gcal_equivalent": 0.388,
      "reading_date": "2024-12-31"
    }
  ]
}
```

### Get Single Invoice
```
GET /invoices/{id}
```

**Response:**
```json
{
  "invoice": {
    "id": "INV-001",
    "customer_id": "CUST-001",
    "date": "2025-01-01",
    "due_date": "2025-01-15",
    "amount": 75.50,
    "paid": 0,
    "outstanding": 75.50,
    "status": "unpaid",
    "kwh_consumed": 450.5,
    "volume_m3": 15.2,
    "gcal_equivalent": 0.388,
    "reading_date": "2024-12-31"
  }
}
```

### Get Unpaid Invoices
```
GET /invoices/unpaid
```

**Response:**
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "due_date": "2025-01-15",
      "outstanding": 75.50
    }
  ],
  "total_outstanding": 150.50
}
```

### Get Consumption History
```
GET /invoices/consumption?months=12
```

**Response:**
```json
{
  "consumption_history": [
    {
      "month": "2024-12",
      "kwh_consumed": 450.5,
      "volume_m3": 15.2,
      "gcal_equivalent": 0.388,
      "amount": 75.50
    }
  ]
}
```

### Download Invoice PDF
```
GET /invoices/{id}/pdf
```

**Response:** PDF file download

---

## Payment Endpoints

### Create Payment
```
POST /payments
```

**Body:**
```json
{
  "invoice_id": "INV-001",
  "amount": 50.00,
  "payment_method": "Card",
  "reference": "SELFCARE-12345"
}
```

**Response:**
```json
{
  "message": "Payment created successfully"
}
```

**Note:** Payments are processed asynchronously via queue. Check payment history for status.

### Get Payment History
```
GET /payments
```

**Response:**
```json
{
  "payments": [
    {
      "name": "PAY-001",
      "posting_date": "2024-12-15",
      "paid_amount": 85.00,
      "reference_no": "SELFCARE-001"
    }
  ]
}
```

### Get Payment Status
```
GET /payments/{paymentId}/status
```

**Response:**
```json
{
  "payment_id": "PAY-001",
  "status": "submitted"
}
```

---

## Admin Endpoints

**Requires `is_admin = true` on user account**

### Get Verification Queue
```
GET /admin/verification-queue?status={pending|verified|rejected}
```

**Response:**
```json
{
  "queue": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "heatmeter_id": "HM-001",
      "verification_status": "pending",
      "verification_method": "invoice",
      "invoice_path": "invoices/abc123.pdf",
      "verified_at": null,
      "created_at": "2025-09-26 10:00:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 20,
    "total": 100
  }
}
```

### Get Verification Stats
```
GET /admin/verification-queue/stats
```

**Response:**
```json
{
  "stats": {
    "pending": 15,
    "verified": 120,
    "rejected": 5,
    "total": 140
  }
}
```

### Get Verification Item Details
```
GET /admin/verification-queue/{id}
```

**Response:**
```json
{
  "item": {
    "id": 1,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "customer_id": "CUST-001"
    },
    "heatmeter_id": "HM-001",
    "verification_status": "pending",
    "verification_method": "invoice",
    "invoice_path": "invoices/abc123.pdf",
    "invoice_url": "/storage/invoices/abc123.pdf",
    "verified_at": null,
    "created_at": "2025-09-26 10:00:00"
  }
}
```

### Approve Verification
```
POST /admin/verification-queue/{id}/approve
```

**Response:**
```json
{
  "message": "Verification approved successfully",
  "item": {
    "id": 1,
    "heatmeter_id": "HM-001",
    "verification_status": "verified"
  }
}
```

### Reject Verification
```
POST /admin/verification-queue/{id}/reject
```

**Body:**
```json
{
  "reason": "Invalid invoice document"
}
```

**Response:**
```json
{
  "message": "Verification rejected successfully",
  "item": {
    "id": 1,
    "heatmeter_id": "HM-001",
    "verification_status": "rejected"
  }
}
```

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (admin access required)
- `404` - Not Found
- `422` - Validation Error

---

## Frontend Integration Guide

### 1. Install Dependencies
```bash
cd frontend
npm install axios
```

### 2. Create API Client

Create `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 3. Create ERP Service

Create `frontend/src/services/erp.service.ts`:

```typescript
import api from './api';

export const erpService = {
  // Customer
  getCustomer: () => api.get('/customer'),
  getBalance: () => api.get('/customer/balance'),
  searchCustomers: (query: string) => api.get(`/customer/search?query=${query}`),
  linkCustomer: (customerId: string) => api.post('/customer/link', { customer_id: customerId }),

  // Invoices
  getInvoices: (status?: 'paid' | 'unpaid') =>
    api.get('/invoices', { params: { status } }),
  getInvoice: (id: string) => api.get(`/invoices/${id}`),
  getUnpaidInvoices: () => api.get('/invoices/unpaid'),
  getConsumptionHistory: (months = 12) =>
    api.get(`/invoices/consumption?months=${months}`),
  downloadInvoicePDF: (id: string) =>
    api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),

  // Payments
  createPayment: (data: {
    invoice_id: string;
    amount: number;
    payment_method?: string;
    reference?: string;
  }) => api.post('/payments', data),
  getPaymentHistory: () => api.get('/payments'),
  getPaymentStatus: (paymentId: string) => api.get(`/payments/${paymentId}/status`),

  // Admin
  getVerificationQueue: (status = 'pending') =>
    api.get(`/admin/verification-queue?status=${status}`),
  getVerificationStats: () => api.get('/admin/verification-queue/stats'),
  getVerificationItem: (id: number) => api.get(`/admin/verification-queue/${id}`),
  approveVerification: (id: number) => api.post(`/admin/verification-queue/${id}/approve`),
  rejectVerification: (id: number, reason?: string) =>
    api.post(`/admin/verification-queue/${id}/reject`, { reason }),
};
```

### 4. Usage Examples

#### Fetch Customer Balance
```typescript
import { erpService } from '@/services/erp.service';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    erpService.getBalance()
      .then(res => setBalance(res.data.balance))
      .catch(err => console.error(err));
  }, []);

  return <div>Balance: €{balance}</div>;
};
```

#### Display Invoices
```typescript
const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    erpService.getInvoices('unpaid')
      .then(res => setInvoices(res.data.invoices))
      .catch(err => console.error(err));
  }, []);

  return (
    <ul>
      {invoices.map(inv => (
        <li key={inv.id}>
          {inv.id} - €{inv.outstanding} (Due: {inv.due_date})
        </li>
      ))}
    </ul>
  );
};
```

#### Process Payment
```typescript
const PaymentForm = ({ invoiceId, amount }) => {
  const handlePayment = async () => {
    try {
      await erpService.createPayment({
        invoice_id: invoiceId,
        amount: amount,
        payment_method: 'Card',
      });
      alert('Payment queued successfully!');
    } catch (error) {
      alert('Payment failed');
    }
  };

  return <button onClick={handlePayment}>Pay Now</button>;
};
```

---

## Testing with MockAdapter

For development/testing, set in `.env`:
```
ERP_PROVIDER=mock
```

MockAdapter returns realistic test data without hitting ERPNext.

For production:
```
ERP_PROVIDER=erpnext
ERPNEXT_URL=https://www.staging.enercopower.com
ERPNEXT_API_KEY=your_api_key
ERPNEXT_API_SECRET=your_api_secret
```
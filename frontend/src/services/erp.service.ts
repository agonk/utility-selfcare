import { apiService } from './api';

export interface Customer {
  id: string;
  name: string;
  address: string;
  heatmeter_id: string | null;
  balance: number;
  status: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  customer_id: string;
  date: string;
  due_date: string;
  amount: number;
  paid: number;
  outstanding: number;
  status: 'paid' | 'unpaid' | 'overdue';
  kwh_consumed: number;
  volume_m3: number;
  gcal_equivalent: number | null;
  reading_date: string | null;
}

export interface ConsumptionHistoryItem {
  month: string;
  kwh_consumed: number;
  volume_m3: number;
  gcal_equivalent: number | null;
  amount: number;
}

export interface PaymentHistoryItem {
  name: string;
  posting_date: string;
  paid_amount: number;
  reference_no: string;
}

export const erpService = {
  customer: {
    async get(): Promise<Customer> {
      const response = await apiService.get<Customer>('/customer');
      return response;
    },

    async getBalance(): Promise<{ balance: number }> {
      return apiService.get('/customer/balance');
    },

    async search(query: string): Promise<{ customers: Customer[] }> {
      return apiService.get(`/customer/search?query=${encodeURIComponent(query)}`);
    },

    async link(customerId: string): Promise<{ message: string }> {
      return apiService.post('/customer/link', { customer_id: customerId });
    },
  },

  invoices: {
    async list(status?: 'paid' | 'unpaid'): Promise<{ invoices: Invoice[] }> {
      const url = status ? `/invoices?status=${status}` : '/invoices';
      return apiService.get(url);
    },

    async get(id: string): Promise<{ invoice: Invoice }> {
      return apiService.get(`/invoices/${id}`);
    },

    async getUnpaid(): Promise<{
      invoices: Array<{ id: string; due_date: string; outstanding: number }>;
      total_outstanding: number;
    }> {
      return apiService.get('/invoices/unpaid');
    },

    async getConsumptionHistory(months = 12): Promise<{
      consumption_history: ConsumptionHistoryItem[];
    }> {
      return apiService.get(`/invoices/consumption?months=${months}`);
    },

    async downloadPDF(id: string): Promise<Blob> {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/invoices/${id}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      return response.blob();
    },
  },

  payments: {
    async create(data: {
      invoice_id: string;
      amount: number;
      payment_method?: 'Card' | 'Bank Transfer' | 'Cash';
      reference?: string;
    }): Promise<{ message: string }> {
      return apiService.post('/payments', data);
    },

    async getHistory(): Promise<{ payments: PaymentHistoryItem[] }> {
      return apiService.get('/payments');
    },

    async getStatus(paymentId: string): Promise<{
      payment_id: string;
      status: string;
    }> {
      return apiService.get(`/payments/${paymentId}/status`);
    },
  },
};
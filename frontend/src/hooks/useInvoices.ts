import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { erpService, Invoice } from '../services/erp.service';

export const useInvoices = (status?: 'paid' | 'unpaid') => {
  return useQuery({
    queryKey: ['invoices', status],
    queryFn: () => erpService.invoices.list(status),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => erpService.invoices.get(id),
    enabled: !!id,
  });
};

export const useUnpaidInvoices = () => {
  return useQuery({
    queryKey: ['invoices', 'unpaid', 'summary'],
    queryFn: () => erpService.invoices.getUnpaid(),
  });
};

export const useConsumptionHistory = (months = 12) => {
  return useQuery({
    queryKey: ['consumption-history', months],
    queryFn: () => erpService.invoices.getConsumptionHistory(months),
  });
};

export const useDownloadInvoicePDF = () => {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const blob = await erpService.invoices.downloadPDF(invoiceId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
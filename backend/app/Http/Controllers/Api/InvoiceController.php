<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    private InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [];

        if ($request->has('status')) {
            $filters['status'] = $request->input('status');
        }

        $invoices = $this->invoiceService->getCustomerInvoices($request->user(), $filters);

        return response()->json([
            'invoices' => $invoices->map(fn($invoice) => [
                'id' => $invoice->id,
                'customer_id' => $invoice->customerId,
                'date' => $invoice->date->format('Y-m-d'),
                'due_date' => $invoice->dueDate->format('Y-m-d'),
                'amount' => $invoice->amount,
                'paid' => $invoice->paid,
                'outstanding' => $invoice->outstanding,
                'status' => $invoice->status,
                'kwh_consumed' => $invoice->kwhConsumed,
                'volume_m3' => $invoice->volumeM3,
                'gcal_equivalent' => $invoice->gcalEquivalent,
                'reading_date' => $invoice->readingDate?->format('Y-m-d'),
            ])
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $invoice = $this->invoiceService->getInvoice($id);

        if (!$invoice) {
            return response()->json([
                'error' => 'Invoice not found'
            ], 404);
        }

        if ($invoice->customerId !== $request->user()->customer_id) {
            return response()->json([
                'error' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'invoice' => [
                'id' => $invoice->id,
                'customer_id' => $invoice->customerId,
                'date' => $invoice->date->format('Y-m-d'),
                'due_date' => $invoice->dueDate->format('Y-m-d'),
                'amount' => $invoice->amount,
                'paid' => $invoice->paid,
                'outstanding' => $invoice->outstanding,
                'status' => $invoice->status,
                'kwh_consumed' => $invoice->kwhConsumed,
                'volume_m3' => $invoice->volumeM3,
                'gcal_equivalent' => $invoice->gcalEquivalent,
                'reading_date' => $invoice->readingDate?->format('Y-m-d'),
            ]
        ]);
    }

    public function unpaid(Request $request): JsonResponse
    {
        $invoices = $this->invoiceService->getUnpaidInvoices($request->user());

        return response()->json([
            'invoices' => $invoices->map(fn($invoice) => [
                'id' => $invoice->id,
                'due_date' => $invoice->dueDate->format('Y-m-d'),
                'outstanding' => $invoice->outstanding,
            ]),
            'total_outstanding' => $this->invoiceService->getTotalOutstanding($request->user())
        ]);
    }

    public function consumption(Request $request): JsonResponse
    {
        $months = $request->input('months', 12);

        $history = $this->invoiceService->getConsumptionHistory($request->user(), $months);

        return response()->json([
            'consumption_history' => $history
        ]);
    }

    public function downloadPDF(Request $request, string $id): Response
    {
        $invoice = $this->invoiceService->getInvoice($id);

        if (!$invoice) {
            abort(404, 'Invoice not found');
        }

        if ($invoice->customerId !== $request->user()->customer_id) {
            abort(403, 'Unauthorized');
        }

        $pdf = $this->invoiceService->getInvoicePDF($id);

        if (!$pdf) {
            abort(500, 'Failed to generate PDF');
        }

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="invoice-' . $id . '.pdf"',
        ]);
    }
}
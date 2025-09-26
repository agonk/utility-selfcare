<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'invoice_id' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string|in:Card,Bank Transfer,Cash',
            'reference' => 'nullable|string',
        ]);

        $success = $this->paymentService->createPayment(
            user: $request->user(),
            invoiceId: $request->input('invoice_id'),
            amount: $request->input('amount'),
            paymentMethod: $request->input('payment_method', 'Card'),
            reference: $request->input('reference')
        );

        if (!$success) {
            return response()->json([
                'error' => 'Failed to create payment'
            ], 400);
        }

        return response()->json([
            'message' => 'Payment created successfully'
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $payments = $this->paymentService->getPaymentHistory($request->user());

        return response()->json([
            'payments' => $payments
        ]);
    }

    public function status(Request $request, string $paymentId): JsonResponse
    {
        $status = $this->paymentService->getPaymentStatus($paymentId);

        if (!$status) {
            return response()->json([
                'error' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'payment_id' => $paymentId,
            'status' => $status
        ]);
    }
}
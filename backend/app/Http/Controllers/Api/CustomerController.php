<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    private CustomerService $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    public function show(Request $request): JsonResponse
    {
        $customer = $this->customerService->getCustomerData($request->user());

        if (!$customer) {
            return response()->json([
                'error' => 'No customer linked to your account'
            ], 404);
        }

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'address' => $customer->address,
            'heatmeter_id' => $customer->heatmeterId,
            'balance' => $customer->balance,
            'status' => $customer->status,
        ]);
    }

    public function balance(Request $request): JsonResponse
    {
        $balance = $this->customerService->getCustomerBalance($request->user());

        return response()->json([
            'balance' => $balance
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $customers = $this->customerService->searchCustomers($request->input('query'));

        return response()->json([
            'customers' => $customers
        ]);
    }

    public function link(Request $request): JsonResponse
    {
        $request->validate([
            'customer_id' => 'required|string'
        ]);

        $success = $this->customerService->linkCustomerToUser(
            $request->user(),
            $request->input('customer_id')
        );

        if (!$success) {
            return response()->json([
                'error' => 'Failed to link customer'
            ], 400);
        }

        return response()->json([
            'message' => 'Customer linked successfully'
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserHeatmeter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VerificationQueueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->input('status', 'pending');

        $queue = UserHeatmeter::with('user')
            ->where('verification_status', $status)
            ->orderBy('created_at', 'asc')
            ->paginate(20);

        return response()->json([
            'queue' => $queue->map(fn($item) => [
                'id' => $item->id,
                'user' => [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                    'email' => $item->user->email,
                ],
                'heatmeter_id' => $item->heatmeter_id,
                'verification_status' => $item->verification_status,
                'verification_method' => $item->verification_method,
                'invoice_path' => $item->invoice_path,
                'verified_at' => $item->verified_at?->toDateTimeString(),
                'created_at' => $item->created_at->toDateTimeString(),
            ]),
            'pagination' => [
                'current_page' => $queue->currentPage(),
                'last_page' => $queue->lastPage(),
                'per_page' => $queue->perPage(),
                'total' => $queue->total(),
            ]
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $item = UserHeatmeter::with('user')->findOrFail($id);

        $invoiceUrl = null;
        if ($item->invoice_path) {
            $invoiceUrl = Storage::disk('local')->url($item->invoice_path);
        }

        return response()->json([
            'item' => [
                'id' => $item->id,
                'user' => [
                    'id' => $item->user->id,
                    'name' => $item->user->name,
                    'email' => $item->user->email,
                    'customer_id' => $item->user->customer_id,
                ],
                'heatmeter_id' => $item->heatmeter_id,
                'verification_status' => $item->verification_status,
                'verification_method' => $item->verification_method,
                'invoice_path' => $item->invoice_path,
                'invoice_url' => $invoiceUrl,
                'verified_at' => $item->verified_at?->toDateTimeString(),
                'created_at' => $item->created_at->toDateTimeString(),
            ]
        ]);
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $item = UserHeatmeter::findOrFail($id);

        if ($item->verification_status !== 'pending') {
            return response()->json([
                'error' => 'Can only approve pending items'
            ], 400);
        }

        $item->verification_status = 'verified';
        $item->verified_at = now();
        $item->save();

        return response()->json([
            'message' => 'Verification approved successfully',
            'item' => [
                'id' => $item->id,
                'heatmeter_id' => $item->heatmeter_id,
                'verification_status' => $item->verification_status,
            ]
        ]);
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500'
        ]);

        $item = UserHeatmeter::findOrFail($id);

        if ($item->verification_status !== 'pending') {
            return response()->json([
                'error' => 'Can only reject pending items'
            ], 400);
        }

        $item->verification_status = 'rejected';
        $item->save();

        return response()->json([
            'message' => 'Verification rejected successfully',
            'item' => [
                'id' => $item->id,
                'heatmeter_id' => $item->heatmeter_id,
                'verification_status' => $item->verification_status,
            ]
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'pending' => UserHeatmeter::where('verification_status', 'pending')->count(),
            'verified' => UserHeatmeter::where('verification_status', 'verified')->count(),
            'rejected' => UserHeatmeter::where('verification_status', 'rejected')->count(),
            'total' => UserHeatmeter::count(),
        ];

        return response()->json(['stats' => $stats]);
    }
}
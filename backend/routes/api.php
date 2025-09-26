<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\VerificationQueueController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/email/verify', [AuthController::class, 'verifyEmail']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);

    // Heatmeter and Verification routes
    Route::prefix('heatmeters')->group(function () {
        Route::get('/', [VerificationController::class, 'getHeatmeters']);
        Route::post('/', [VerificationController::class, 'addHeatmeter']);

        Route::prefix('{heatmeter}')->group(function () {
            Route::delete('/', [VerificationController::class, 'removeHeatmeter']);
            Route::post('/set-primary', [VerificationController::class, 'setPrimary']);

            // OTP verification
            Route::post('/verify/otp/send', [VerificationController::class, 'sendOTP']);
            Route::post('/verify/otp/verify', [VerificationController::class, 'verifyOTP']);
            Route::post('/verify/otp/resend', [VerificationController::class, 'resendOTP']);

            // Invoice verification
            Route::post('/verify/invoice', [VerificationController::class, 'uploadInvoice']);
        });
    });

    Route::prefix('customer')->group(function () {
        Route::get('/', [CustomerController::class, 'show']);
        Route::get('/balance', [CustomerController::class, 'balance']);
        Route::get('/search', [CustomerController::class, 'search']);
        Route::post('/link', [CustomerController::class, 'link']);
    });

    Route::prefix('invoices')->group(function () {
        Route::get('/', [InvoiceController::class, 'index']);
        Route::get('/unpaid', [InvoiceController::class, 'unpaid']);
        Route::get('/consumption', [InvoiceController::class, 'consumption']);
        Route::get('/{id}', [InvoiceController::class, 'show']);
        Route::get('/{id}/pdf', [InvoiceController::class, 'downloadPDF']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::get('/{paymentId}/status', [PaymentController::class, 'status']);
    });

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::prefix('verification-queue')->group(function () {
            Route::get('/', [VerificationQueueController::class, 'index']);
            Route::get('/stats', [VerificationQueueController::class, 'stats']);
            Route::get('/{id}', [VerificationQueueController::class, 'show']);
            Route::post('/{id}/approve', [VerificationQueueController::class, 'approve']);
            Route::post('/{id}/reject', [VerificationQueueController::class, 'reject']);
        });
    });
});

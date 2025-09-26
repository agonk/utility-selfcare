<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VerificationController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

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
});

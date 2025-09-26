<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserHeatmeter;
use App\Models\Verification;
use App\Services\OTPService;
use App\Services\OCRService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class VerificationController extends Controller
{
    protected $otpService;
    protected $ocrService;

    public function __construct(OTPService $otpService, OCRService $ocrService)
    {
        $this->otpService = $otpService;
        $this->ocrService = $ocrService;
    }

    /**
     * Add a new heatmeter to user account
     */
    public function addHeatmeter(Request $request)
    {
        $validated = $request->validate([
            'heatmeter_id' => 'required|string|max:100',
            'is_owner' => 'boolean',
        ]);

        $user = auth()->user();

        // Check if heatmeter already exists for this user
        $existing = UserHeatmeter::where('user_id', $user->id)
            ->where('heatmeter_id', $validated['heatmeter_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Heatmeter already associated with your account',
                'heatmeter' => $existing,
            ], 200);
        }

        // Create new heatmeter association
        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => $validated['heatmeter_id'],
            'is_owner' => $validated['is_owner'] ?? true,
            'is_primary' => !$user->heatmeters()->exists(), // First heatmeter is primary
        ]);

        return response()->json([
            'message' => 'Heatmeter added successfully. Verification required.',
            'heatmeter' => $heatmeter,
            'requires_verification' => true,
            'verification_methods' => ['otp', 'invoice'],
        ], 201);
    }

    /**
     * Get user's heatmeters
     */
    public function getHeatmeters()
    {
        $user = auth()->user();
        $heatmeters = $user->heatmeters()->with('user:id,name,email')->get();

        return response()->json([
            'heatmeters' => $heatmeters,
        ]);
    }

    /**
     * Send OTP for heatmeter verification
     */
    public function sendOTP(Request $request, $heatmeterId)
    {
        $user = auth()->user();

        // Check if user has this heatmeter
        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        if ($heatmeter->isVerified()) {
            return response()->json(['message' => 'Heatmeter already verified'], 200);
        }

        // Check if user has phone number
        if (!$user->phone) {
            return response()->json([
                'message' => 'Phone number required for OTP verification',
            ], 422);
        }

        try {
            $verification = $this->otpService->sendOTP($user, $heatmeter->heatmeter_id);

            return response()->json([
                'message' => 'OTP sent successfully',
                'expires_in_minutes' => Verification::OTP_EXPIRY_MINUTES,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Verify OTP code
     */
    public function verifyOTP(Request $request, $heatmeterId)
    {
        $validated = $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = auth()->user();

        // Check if user has this heatmeter
        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        if ($heatmeter->isVerified()) {
            return response()->json(['message' => 'Heatmeter already verified'], 200);
        }

        $isValid = $this->otpService->verifyOTP($user, $heatmeter->heatmeter_id, $validated['code']);

        if ($isValid) {
            return response()->json([
                'message' => 'Heatmeter verified successfully',
                'heatmeter' => $heatmeter->fresh(),
            ]);
        } else {
            return response()->json([
                'message' => 'Invalid or expired OTP code',
            ], 422);
        }
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request, $heatmeterId)
    {
        $user = auth()->user();

        // Check if user has this heatmeter
        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        if ($heatmeter->isVerified()) {
            return response()->json(['message' => 'Heatmeter already verified'], 200);
        }

        try {
            $verification = $this->otpService->resendOTP($user, $heatmeter->heatmeter_id);

            return response()->json([
                'message' => 'OTP resent successfully',
                'expires_in_minutes' => Verification::OTP_EXPIRY_MINUTES,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Upload invoice for verification
     */
    public function uploadInvoice(Request $request, $heatmeterId)
    {
        $validated = $request->validate([
            'invoice' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
        ]);

        $user = auth()->user();

        // Check if user has this heatmeter
        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        if ($heatmeter->isVerified()) {
            return response()->json(['message' => 'Heatmeter already verified'], 200);
        }

        // Store the file
        $file = $request->file('invoice');
        $path = $file->store('verifications/' . $user->id, 'private');

        // Create verification record
        $verification = Verification::createInvoiceVerification(
            $user->id,
            $heatmeter->heatmeter_id,
            $path
        );

        // Process with OCR
        try {
            $ocrResult = $this->ocrService->processInvoice($path);

            // Auto-verify if OCR finds matching heatmeter ID
            if ($ocrResult['heatmeter_id'] === $heatmeter->heatmeter_id) {
                $verification->markAsVerified();
                $heatmeter->markAsVerified(Verification::TYPE_INVOICE);

                Log::info('Invoice auto-verified via OCR', [
                    'user_id' => $user->id,
                    'heatmeter_id' => $heatmeter->heatmeter_id,
                ]);

                return response()->json([
                    'message' => 'Invoice verified successfully',
                    'heatmeter' => $heatmeter->fresh(),
                ]);
            } else {
                // Queue for manual review
                Log::info('Invoice queued for manual review', [
                    'user_id' => $user->id,
                    'heatmeter_id' => $heatmeter->heatmeter_id,
                    'ocr_result' => $ocrResult,
                ]);

                return response()->json([
                    'message' => 'Invoice uploaded and queued for manual review',
                    'status' => 'pending_review',
                ]);
            }
        } catch (\Exception $e) {
            Log::error('OCR processing failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Invoice uploaded and queued for manual review',
                'status' => 'pending_review',
            ]);
        }
    }

    /**
     * Set primary heatmeter
     */
    public function setPrimary(Request $request, $heatmeterId)
    {
        $user = auth()->user();

        // Check if user has this heatmeter
        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        if (!$heatmeter->isVerified()) {
            return response()->json(['message' => 'Heatmeter must be verified first'], 422);
        }

        // Remove primary from all other heatmeters
        $user->heatmeters()->update(['is_primary' => false]);

        // Set this as primary
        $heatmeter->update(['is_primary' => true]);

        return response()->json([
            'message' => 'Primary heatmeter updated',
            'heatmeter' => $heatmeter,
        ]);
    }

    /**
     * Remove heatmeter
     */
    public function removeHeatmeter($heatmeterId)
    {
        $user = auth()->user();

        $heatmeter = $user->heatmeters()->where('id', $heatmeterId)->first();

        if (!$heatmeter) {
            return response()->json(['message' => 'Heatmeter not found'], 404);
        }

        // Don't allow removing primary if there are other heatmeters
        if ($heatmeter->is_primary && $user->heatmeters()->count() > 1) {
            return response()->json([
                'message' => 'Cannot remove primary heatmeter. Set another as primary first.',
            ], 422);
        }

        $heatmeter->delete();

        return response()->json([
            'message' => 'Heatmeter removed successfully',
        ]);
    }
}
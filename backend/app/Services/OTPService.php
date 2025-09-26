<?php

namespace App\Services;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Support\Facades\Log;

class OTPService
{
    protected $smsService;

    public function __construct(SMSService $smsService)
    {
        $this->smsService = $smsService;
    }

    public function sendOTP(User $user, string $heatmeterId): Verification
    {
        // Invalidate any existing active OTPs
        Verification::where('user_id', $user->id)
            ->where('heatmeter_id', $heatmeterId)
            ->where('type', Verification::TYPE_OTP)
            ->active()
            ->update(['expires_at' => now()]);

        // Create new OTP
        $verification = Verification::createOTP($user->id, $heatmeterId);

        // Send OTP via SMS
        $message = $this->formatOTPMessage($verification->token);

        try {
            $this->smsService->send($user->phone, $message);

            Log::info('OTP sent successfully', [
                'user_id' => $user->id,
                'heatmeter_id' => $heatmeterId,
                'phone' => $user->phone
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send OTP', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            throw new \Exception('Failed to send OTP. Please try again.');
        }

        return $verification;
    }

    public function verifyOTP(User $user, string $heatmeterId, string $code): bool
    {
        $verification = Verification::where('user_id', $user->id)
            ->where('heatmeter_id', $heatmeterId)
            ->where('type', Verification::TYPE_OTP)
            ->active()
            ->latest()
            ->first();

        if (!$verification) {
            return false;
        }

        $isValid = $verification->verifyOTP($code);

        if ($isValid) {
            // Mark the heatmeter as verified
            $userHeatmeter = $user->heatmeters()
                ->where('heatmeter_id', $heatmeterId)
                ->first();

            if ($userHeatmeter) {
                $userHeatmeter->markAsVerified(Verification::TYPE_OTP);
            }

            Log::info('OTP verified successfully', [
                'user_id' => $user->id,
                'heatmeter_id' => $heatmeterId
            ]);
        } else {
            Log::warning('Invalid OTP attempt', [
                'user_id' => $user->id,
                'heatmeter_id' => $heatmeterId,
                'attempts' => $verification->attempts
            ]);
        }

        return $isValid;
    }

    public function resendOTP(User $user, string $heatmeterId): Verification
    {
        // Check if we can resend (rate limiting)
        $lastOTP = Verification::where('user_id', $user->id)
            ->where('heatmeter_id', $heatmeterId)
            ->where('type', Verification::TYPE_OTP)
            ->latest()
            ->first();

        if ($lastOTP && $lastOTP->created_at->addMinutes(1)->isFuture()) {
            throw new \Exception('Please wait 1 minute before requesting a new OTP.');
        }

        return $this->sendOTP($user, $heatmeterId);
    }

    protected function formatOTPMessage(string $otp): string
    {
        return "Your verification code is: {$otp}. This code will expire in " . Verification::OTP_EXPIRY_MINUTES . " minutes.";
    }
}
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerifyEmail;
use Illuminate\Support\Facades\Log;

class EmailVerificationService
{
    public function sendVerificationEmail(User $user): bool
    {
        try {
            $verification = Verification::createEmailVerification($user->id);

            Mail::to($user->email)->send(new VerifyEmail($user, $verification));

            Log::info('Email verification sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'token' => substr($verification->token, 0, 8) . '...',
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function verifyEmail(string $token): ?User
    {
        $verification = Verification::where('token', $token)
            ->where('type', Verification::TYPE_EMAIL)
            ->where('verified_at', null)
            ->where('expires_at', '>', now())
            ->first();

        if (!$verification) {
            return null;
        }

        $user = User::find($verification->user_id);

        if (!$user) {
            return null;
        }

        $verification->update([
            'verified_at' => now(),
        ]);

        $user->update([
            'email_verified_at' => now(),
        ]);

        Log::info('Email verified successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return $user;
    }

    public function resendVerificationEmail(User $user): bool
    {
        if ($user->email_verified_at) {
            return false;
        }

        $lastVerification = Verification::where('user_id', $user->id)
            ->where('type', Verification::TYPE_EMAIL)
            ->where('verified_at', null)
            ->latest()
            ->first();

        if ($lastVerification && $lastVerification->created_at->gt(now()->subMinutes(5))) {
            Log::warning('Verification email rate limited', [
                'user_id' => $user->id,
                'last_sent' => $lastVerification->created_at,
            ]);
            return false;
        }

        return $this->sendVerificationEmail($user);
    }
}
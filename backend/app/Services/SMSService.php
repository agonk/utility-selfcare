<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class SMSService
{
    protected $provider;
    protected $enabled;

    public function __construct()
    {
        $this->provider = config('services.sms.provider', 'log'); // 'log', 'twilio', 'local'
        $this->enabled = config('services.sms.enabled', true);
    }

    public function send(string $phone, string $message): bool
    {
        if (!$this->enabled) {
            Log::info('SMS service is disabled. Message not sent.', [
                'phone' => $phone,
                'message' => $message
            ]);
            return true;
        }

        // Validate phone number (Kosovo format)
        if (!$this->isValidKosovoPhone($phone)) {
            throw new \InvalidArgumentException('Invalid phone number format. Must be Kosovo format (+383...)');
        }

        switch ($this->provider) {
            case 'twilio':
                return $this->sendViaTwilio($phone, $message);
            case 'local':
                return $this->sendViaLocalProvider($phone, $message);
            default:
                // Log provider - just log the message for development
                return $this->sendViaLog($phone, $message);
        }
    }

    protected function sendViaTwilio(string $phone, string $message): bool
    {
        // TODO: Implement Twilio integration
        // $twilio = new \Twilio\Rest\Client(
        //     config('services.twilio.sid'),
        //     config('services.twilio.token')
        // );
        //
        // $twilio->messages->create($phone, [
        //     'from' => config('services.twilio.from'),
        //     'body' => $message
        // ]);

        Log::info('Twilio SMS would be sent', [
            'phone' => $phone,
            'message' => $message
        ]);

        return true;
    }

    protected function sendViaLocalProvider(string $phone, string $message): bool
    {
        // TODO: Implement local Kosovo/Albania SMS provider
        // This would integrate with local telecom APIs

        Log::info('Local SMS provider would be used', [
            'phone' => $phone,
            'message' => $message
        ]);

        return true;
    }

    protected function sendViaLog(string $phone, string $message): bool
    {
        Log::channel('sms')->info('SMS Message', [
            'to' => $phone,
            'message' => $message,
            'timestamp' => now()->toIso8601String()
        ]);

        return true;
    }

    protected function isValidKosovoPhone(string $phone): bool
    {
        // Kosovo phone format: +383 followed by 8-9 digits
        // Albania phone format: +355 followed by 9 digits
        return preg_match('/^(\+383[0-9]{8,9}|\+355[0-9]{9})$/', $phone);
    }
}
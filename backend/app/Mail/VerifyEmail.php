<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Verification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Verification $verification
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Email Address - Termokos Self-Care',
        );
    }

    public function content(): Content
    {
        $verificationUrl = config('app.frontend_url')
            . '/verify-email?token=' . $this->verification->token;

        return new Content(
            view: 'emails.verify',
            with: [
                'userName' => $this->user->name,
                'verificationUrl' => $verificationUrl,
                'expiresIn' => $this->verification->expires_at->diffForHumans(),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
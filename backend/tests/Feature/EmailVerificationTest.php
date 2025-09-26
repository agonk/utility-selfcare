<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Verification;
use App\Mail\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_email_verification_sent_on_registration()
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'message' => 'Registration successful. Please check your email to verify your account.',
            ]);

        Mail::assertSent(VerifyEmail::class, function ($mail) {
            return $mail->hasTo('test@example.com');
        });

        $this->assertDatabaseHas('verifications', [
            'type' => 'email',
        ]);
    }

    public function test_can_verify_email_with_valid_token()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $verification = Verification::createEmailVerification($user->id);

        $response = $this->postJson('/api/email/verify', [
            'token' => $verification->token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Email verified successfully.',
            ]);

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);

        $verification->refresh();
        $this->assertNotNull($verification->verified_at);
    }

    public function test_cannot_verify_email_with_invalid_token()
    {
        $response = $this->postJson('/api/email/verify', [
            'token' => str_repeat('a', 64),
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Invalid or expired verification token.',
            ]);
    }

    public function test_cannot_verify_email_with_expired_token()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $verification = Verification::createEmailVerification($user->id);

        $verification->update([
            'expires_at' => now()->subMinutes(1),
        ]);

        $response = $this->postJson('/api/email/verify', [
            'token' => $verification->token,
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Invalid or expired verification token.',
            ]);
    }

    public function test_can_resend_verification_email()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/email/resend');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Verification email sent.',
            ]);

        Mail::assertSent(VerifyEmail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_cannot_resend_if_already_verified()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/email/resend');

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Email already verified.',
            ]);

        Mail::assertNotSent(VerifyEmail::class);
    }

    public function test_resend_rate_limiting()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        Verification::createEmailVerification($user->id);

        $this->actingAs($user, 'sanctum');

        $response = $this->postJson('/api/email/resend');

        $response->assertStatus(429)
            ->assertJson([
                'message' => 'Please wait before requesting another verification email.',
            ]);
    }

    public function test_email_verification_token_is_unique()
    {
        $user1 = User::factory()->create(['email_verified_at' => null]);
        $user2 = User::factory()->create(['email_verified_at' => null]);

        $verification1 = Verification::createEmailVerification($user1->id);
        $verification2 = Verification::createEmailVerification($user2->id);

        $this->assertNotEquals($verification1->token, $verification2->token);
    }

    public function test_old_verification_tokens_are_deleted_on_new_request()
    {
        $user = User::factory()->create(['email_verified_at' => null]);

        $oldVerification = Verification::createEmailVerification($user->id);
        $oldToken = $oldVerification->token;

        $this->travel(6)->minutes();

        $newVerification = Verification::createEmailVerification($user->id);

        $this->assertDatabaseMissing('verifications', [
            'token' => $oldToken,
            'verified_at' => null,
        ]);

        $this->assertDatabaseHas('verifications', [
            'token' => $newVerification->token,
            'verified_at' => null,
        ]);
    }
}
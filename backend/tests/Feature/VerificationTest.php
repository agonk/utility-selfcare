<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserHeatmeter;
use App\Models\Verification;
use App\Services\SMSService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
    }

    public function test_user_can_add_heatmeter()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/heatmeters', [
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Heatmeter added successfully. Verification required.',
                'requires_verification' => true,
                'verification_methods' => ['otp', 'invoice'],
            ]);

        $this->assertDatabaseHas('user_heatmeters', [
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
            'is_primary' => true,
        ]);
    }

    public function test_user_cannot_add_duplicate_heatmeter()
    {
        $user = User::factory()->create();
        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
            'is_primary' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/heatmeters', [
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Heatmeter already associated with your account',
            ]);
    }

    public function test_user_can_get_their_heatmeters()
    {
        $user = User::factory()->create();
        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
            'is_primary' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/heatmeters');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'heatmeters')
            ->assertJsonFragment([
                'heatmeter_id' => 'HM123456',
            ]);
    }

    public function test_user_can_request_otp_verification()
    {
        // Mock SMS service
        $this->mock(SMSService::class, function ($mock) {
            $mock->shouldReceive('send')
                ->once()
                ->andReturn(true);
        });

        $user = User::factory()->create([
            'phone' => '+38344123456',
        ]);

        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/heatmeters/{$heatmeter->id}/verify/otp/send");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'OTP sent successfully',
                'expires_in_minutes' => 10,
            ]);

        $this->assertDatabaseHas('verifications', [
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'type' => 'otp',
        ]);
    }

    public function test_user_can_verify_with_correct_otp()
    {
        $user = User::factory()->create([
            'phone' => '+38344123456',
        ]);

        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        $verification = Verification::createOTP($user->id, 'HM123456');

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/heatmeters/{$heatmeter->id}/verify/otp/verify", [
            'code' => $verification->token,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Heatmeter verified successfully',
            ]);

        $this->assertNotNull($heatmeter->fresh()->verified_at);
        $this->assertEquals('otp', $heatmeter->fresh()->verification_method);
    }

    public function test_user_cannot_verify_with_invalid_otp()
    {
        $user = User::factory()->create([
            'phone' => '+38344123456',
        ]);

        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        $verification = Verification::createOTP($user->id, 'HM123456');

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/heatmeters/{$heatmeter->id}/verify/otp/verify", [
            'code' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Invalid or expired OTP code',
            ]);

        $this->assertNull($heatmeter->fresh()->verified_at);
    }

    public function test_user_can_upload_invoice_for_verification()
    {
        $user = User::factory()->create();

        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_owner' => true,
        ]);

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('invoice.pdf', 1000, 'application/pdf');

        $response = $this->postJson("/api/heatmeters/{$heatmeter->id}/verify/invoice", [
            'invoice' => $file,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('verifications', [
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'type' => 'invoice',
        ]);

        Storage::disk('private')->assertExists('verifications/' . $user->id);
    }

    public function test_user_can_set_primary_heatmeter()
    {
        $user = User::factory()->create();

        $heatmeter1 = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_primary' => true,
            'verified_at' => now(),
            'verification_method' => 'otp',
        ]);

        $heatmeter2 = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM789012',
            'is_primary' => false,
            'verified_at' => now(),
            'verification_method' => 'otp',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/heatmeters/{$heatmeter2->id}/set-primary");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Primary heatmeter updated',
            ]);

        $this->assertFalse($heatmeter1->fresh()->is_primary);
        $this->assertTrue($heatmeter2->fresh()->is_primary);
    }

    public function test_user_cannot_set_unverified_heatmeter_as_primary()
    {
        $user = User::factory()->create();

        $heatmeter = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_primary' => false,
            'verified_at' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/heatmeters/{$heatmeter->id}/set-primary");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Heatmeter must be verified first',
            ]);
    }

    public function test_user_can_remove_non_primary_heatmeter()
    {
        $user = User::factory()->create();

        $heatmeter1 = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'is_primary' => true,
        ]);

        $heatmeter2 = UserHeatmeter::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM789012',
            'is_primary' => false,
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/heatmeters/{$heatmeter2->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Heatmeter removed successfully',
            ]);

        $this->assertDatabaseMissing('user_heatmeters', [
            'id' => $heatmeter2->id,
        ]);
    }

    public function test_otp_expires_after_time_limit()
    {
        $user = User::factory()->create();

        $verification = Verification::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'type' => 'otp',
            'token' => '123456',
            'expires_at' => now()->subMinutes(15),
        ]);

        $this->assertTrue($verification->isExpired());
    }

    public function test_otp_blocks_after_max_attempts()
    {
        $user = User::factory()->create();

        $verification = Verification::create([
            'user_id' => $user->id,
            'heatmeter_id' => 'HM123456',
            'type' => 'otp',
            'token' => '123456',
            'expires_at' => now()->addMinutes(10),
            'attempts' => 3,
        ]);

        $this->assertTrue($verification->hasExceededAttempts());

        $result = $verification->verifyOTP('123456');
        $this->assertFalse($result);
    }
}
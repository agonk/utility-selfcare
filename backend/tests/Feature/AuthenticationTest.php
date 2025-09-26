<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('user can register', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'phone' => '+38344123456',
        'language' => 'sq',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
                'phone',
                'language',
            ],
            'token',
            'message',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test User',
        'phone' => '+38344123456',
        'language' => 'sq',
    ]);
});

test('user cannot register with existing email', function () {
    User::factory()->create([
        'email' => 'existing@example.com',
    ]);

    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
            ],
            'token',
            'message',
        ]);
});

test('user cannot login with invalid credentials', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('user account locks after five failed attempts', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
        'login_attempts' => 0,
    ]);

    // Make 5 failed login attempts
    for ($i = 1; $i <= 5; $i++) {
        $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);
    }

    // Refresh the user to get updated data
    $user->refresh();
    expect($user->login_attempts)->toBe(5);
    expect($user->locked_until)->not->toBeNull();

    // Try to login with correct password
    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'errors' => [
                'email' => ['Your account has been locked due to too many failed login attempts. Please try again later.'],
            ],
        ]);
});

test('authenticated user can get profile', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/user');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user' => [
                'id',
                'name',
                'email',
            ],
        ]);
});

test('unauthenticated user cannot get profile', function () {
    $response = $this->getJson('/api/user');

    $response->assertStatus(401);
});

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logged out successfully',
        ]);

    // Verify token is deleted
    $this->assertDatabaseCount('personal_access_tokens', 0);
});

test('user can refresh token', function () {
    $user = User::factory()->create();
    $oldToken = $user->createToken('test-token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $oldToken,
    ])->postJson('/api/refresh');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'user',
            'token',
            'message',
        ]);

    // Old token should be deleted, new one created
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

test('password confirmation required for registration', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        // Missing password_confirmation
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('password');
});
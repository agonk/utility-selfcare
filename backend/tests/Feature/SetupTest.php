<?php

use Illuminate\Support\Facades\Redis;

test('application is running', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});

test('database connection works', function () {
    $this->assertDatabaseMissing('users', [
        'email' => 'test@example.com'
    ]);
});

test('redis connection works', function () {
    if (!extension_loaded('redis')) {
        $this->markTestSkipped('PHP Redis extension not installed');
    }

    Redis::set('test_key', 'test_value');
    $value = Redis::get('test_key');

    expect($value)->toBe('test_value');

    Redis::del('test_key');
});
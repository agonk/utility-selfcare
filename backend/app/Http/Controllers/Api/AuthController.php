<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailVerificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected EmailVerificationService $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'language' => 'nullable|string|in:sq,en',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'language' => $validated['language'] ?? 'sq',
        ]);

        $this->emailVerificationService->sendVerificationEmail($user);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Registration successful. Please check your email to verify your account.',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->isAccountLocked()) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been locked due to too many failed login attempts. Please try again later.'],
            ]);
        }

        if (!Hash::check($validated['password'], $user->password)) {
            $user->incrementLoginAttempts();

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->resetLoginAttempts();

        $tokenName = 'auth-token';
        if ($request->boolean('remember')) {
            $token = $user->createToken($tokenName, ['*'], now()->addDays(30))->plainTextToken;
        } else {
            $token = $user->createToken($tokenName)->plainTextToken;
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Token refreshed successfully',
        ]);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|size:64',
        ]);

        $user = $this->emailVerificationService->verifyEmail($validated['token']);

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired verification token.',
            ], 400);
        }

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
        ]);
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        $sent = $this->emailVerificationService->resendVerificationEmail($user);

        if (!$sent) {
            return response()->json([
                'message' => 'Please wait before requesting another verification email.',
            ], 429);
        }

        return response()->json([
            'message' => 'Verification email sent.',
        ]);
    }
}
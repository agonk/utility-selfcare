<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Verification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'heatmeter_id',
        'type',
        'token',
        'file_path',
        'expires_at',
        'attempts',
        'verified_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'attempts' => 'integer',
    ];

    const TYPE_OTP = 'otp';
    const TYPE_INVOICE = 'invoice';
    const TYPE_EMAIL = 'email';

    const MAX_ATTEMPTS = 3;
    const OTP_EXPIRY_MINUTES = 10;
    const EMAIL_EXPIRY_HOURS = 24;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function createOTP(int $userId, string $heatmeterId): self
    {
        return static::create([
            'user_id' => $userId,
            'heatmeter_id' => $heatmeterId,
            'type' => self::TYPE_OTP,
            'token' => static::generateOTP(),
            'expires_at' => now()->addMinutes(self::OTP_EXPIRY_MINUTES),
        ]);
    }

    public static function createEmailVerification(int $userId): self
    {
        static::where('user_id', $userId)
            ->where('type', self::TYPE_EMAIL)
            ->where('verified_at', null)
            ->delete();

        return static::create([
            'user_id' => $userId,
            'type' => self::TYPE_EMAIL,
            'token' => Str::random(64),
            'expires_at' => now()->addHours(self::EMAIL_EXPIRY_HOURS),
        ]);
    }

    public static function createInvoiceVerification(int $userId, string $heatmeterId, string $filePath): self
    {
        return static::create([
            'user_id' => $userId,
            'heatmeter_id' => $heatmeterId,
            'type' => self::TYPE_INVOICE,
            'file_path' => $filePath,
            'token' => Str::random(32),
            'expires_at' => now()->addDays(7),
        ]);
    }

    public static function generateOTP(): string
    {
        return str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function hasExceededAttempts(): bool
    {
        return $this->attempts >= self::MAX_ATTEMPTS;
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    public function markAsVerified(): void
    {
        $this->update(['verified_at' => now()]);
    }

    public function verifyOTP(string $code): bool
    {
        if ($this->isExpired() || $this->hasExceededAttempts() || $this->isVerified()) {
            return false;
        }

        $this->incrementAttempts();

        if ($this->token === $code) {
            $this->markAsVerified();
            return true;
        }

        return false;
    }

    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now())
                     ->whereNull('verified_at')
                     ->where('attempts', '<', self::MAX_ATTEMPTS);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForHeatmeter($query, string $heatmeterId)
    {
        return $query->where('heatmeter_id', $heatmeterId);
    }
}
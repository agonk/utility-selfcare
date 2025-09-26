<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserHeatmeter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'heatmeter_id',
        'customer_name',
        'customer_id',
        'verified_at',
        'verification_method',
        'is_primary',
        'is_owner',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'is_primary' => 'boolean',
        'is_owner' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function markAsVerified(string $method): void
    {
        $this->update([
            'verified_at' => now(),
            'verification_method' => $method,
        ]);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }

    public function scopeUnverified($query)
    {
        return $query->whereNull('verified_at');
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }
}
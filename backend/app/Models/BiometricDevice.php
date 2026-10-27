<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BiometricDevice extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'device_id',
        'name',
        'model',
        'location',
        'firmware_version',
        'api_key_fingerprint',
        'status',
        'last_heartbeat',
        'pending_sync_count',
    ];

    protected $casts = [
        'last_heartbeat' => 'datetime',
        'pending_sync_count' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}

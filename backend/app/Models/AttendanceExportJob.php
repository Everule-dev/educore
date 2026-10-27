<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceExportJob extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'requested_by',
        'status',
        'filter_summary',
        'record_count',
        'download_url',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'record_count' => 'integer',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}

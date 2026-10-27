<?php

namespace App\Models;

use App\Enums\CredentialStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Credential extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'recipient_type',
        'recipient_id',
        'recipient_name',
        'credential_number',
        'credential_type',
        'title',
        'description',
        'issuer_user_id',
        'approved_by',
        'approved_at',
        'issued_at',
        'status',
        'canonical_data_version',
        'hash_algorithm',
        'credential_hash',
        'verification_id',
        'document_path',
        'supersedes_credential_id',
        'revocation_reason',
    ];

    protected $casts = [
        'status' => CredentialStatus::class,
        'approved_at' => 'datetime',
        'issued_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issuer_user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function supersedes(): BelongsTo
    {
        return $this->belongsTo(Credential::class, 'supersedes_credential_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(CredentialEvent::class)->orderBy('created_at', 'asc');
    }

    public function verificationLogs(): HasMany
    {
        return $this->hasMany(VerificationLog::class);
    }
}

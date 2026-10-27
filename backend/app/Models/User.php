<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'mfa_enabled',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'mfa_enabled' => 'boolean',
        'password' => 'hashed',
    ];

    public function tenantMemberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_memberships')
            ->withPivot('role_id', 'status', 'invited_by')
            ->withTimestamps();
    }

    public function companyMemberships(): HasMany
    {
        return $this->hasMany(CompanyMembership::class);
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_memberships')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function isPlatformAdmin(): bool
    {
        return $this->tenantMemberships()
            ->whereHas('role', function ($q) {
                $q->where('name', 'platform_admin');
            })
            ->where('status', 'active')
            ->exists();
    }

    public function hasRoleInTenant(string $roleName, string $tenantId): bool
    {
        return $this->tenantMemberships()
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->whereHas('role', function ($q) use ($roleName) {
                $q->where('name', $roleName);
            })
            ->exists();
    }
}

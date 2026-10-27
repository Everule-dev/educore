<?php

namespace App\Models;

use App\Enums\TenantStatus;
use App\Enums\TenantType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'tenant_type',
        'institution_type',
        'registration_number',
        'email',
        'phone',
        'address',
        'state',
        'lga',
        'country_code',
        'status',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'tenant_type' => TenantType::class,
        'status' => TenantStatus::class,
        'approved_at' => 'datetime',
    ];

    public function memberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tenant_memberships')
            ->withPivot('role_id', 'status', 'invited_by')
            ->withTimestamps();
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function staff(): HasMany
    {
        return $this->hasMany(Staff::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function academicPeriods(): HasMany
    {
        return $this->hasMany(AcademicPeriod::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function credentials(): HasMany
    {
        return $this->hasMany(Credential::class);
    }

    public function biometricDevices(): HasMany
    {
        return $this->hasMany(BiometricDevice::class);
    }

    public function biometricMappings(): HasMany
    {
        return $this->hasMany(BiometricIdentityMapping::class);
    }

    public function attendanceExportJobs(): HasMany
    {
        return $this->hasMany(AttendanceExportJob::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }
}

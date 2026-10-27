<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'student_number',
        'first_name',
        'last_name',
        'email',
        'date_of_birth',
        'gender',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function credentials(): HasMany
    {
        return $this->hasMany(Credential::class, 'recipient_id');
    }
}

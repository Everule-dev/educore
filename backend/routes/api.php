<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BiometricController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\CredentialController;
use App\Http\Controllers\Api\V1\PlatformAdminController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\VerificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| EDUCORE API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // 1. Public Authentication & Registration (Throttled against brute force)
    Route::prefix('auth')->middleware('throttle:15,1')->group(function () {
        Route::post('/register/school', [AuthController::class, 'registerSchool']);
        Route::post('/register/organization', [AuthController::class, 'registerOrganization']);
        Route::post('/register/company', [AuthController::class, 'registerCompany']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::post('/bootstrap-superadmin', [PlatformAdminController::class, 'bootstrapSuperAdmin']);
    });

    // 2. Universal Public Verification (Rate-limited, privacy-safe)
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/verify', [VerificationController::class, 'verify']);
        Route::get('/verify/{verification_id}', [VerificationController::class, 'verifyById']);
    });

    // 3. Authenticated Tenant & Institution Operations
    Route::middleware(['auth:sanctum', 'tenant.context'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/tenants/current', [AuthController::class, 'currentTenant']);
        Route::post('/tenants/{tenant}/switch', [AuthController::class, 'switchTenant']);

        // Student & Member Rosters
        Route::apiResource('students', StudentController::class);
        Route::post('/students/{id}/archive', [StudentController::class, 'archive']);

        // Academic Courses & Enrollments
        Route::apiResource('courses', CourseController::class);

        // Attendance Recording & Corrections
        Route::get('/attendance', [AttendanceController::class, 'index']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::patch('/attendance/{id}', [AttendanceController::class, 'update']);
        Route::post('/attendance/export', [AttendanceController::class, 'export']);

        // Biometric Hardware Terminals & Identity Mapping
        Route::get('/biometrics/devices', [BiometricController::class, 'devices']);
        Route::post('/biometrics/devices', [BiometricController::class, 'registerDevice']);
        Route::get('/biometrics/mappings', [BiometricController::class, 'mappings']);
        Route::post('/biometrics/mappings', [BiometricController::class, 'createMapping']);
        Route::post('/biometrics/events/ingest', [BiometricController::class, 'ingestEvent']);

        // Credential Lifecycle
        Route::get('/credentials', [CredentialController::class, 'index']);
        Route::post('/credentials', [CredentialController::class, 'store']);
        Route::get('/credentials/{id}', [CredentialController::class, 'show']);
        Route::patch('/credentials/{id}', [CredentialController::class, 'update']);
        Route::post('/credentials/{id}/submit', [CredentialController::class, 'submit']);
        Route::post('/credentials/{id}/approve', [CredentialController::class, 'approve']);
        Route::post('/credentials/{id}/reject', [CredentialController::class, 'reject']);
        Route::post('/credentials/{id}/issue', [CredentialController::class, 'issue']);
        Route::post('/credentials/{id}/revoke', [CredentialController::class, 'revoke']);
        Route::post('/credentials/{id}/supersede', [CredentialController::class, 'supersede']);
        Route::get('/credentials/{id}/document', [CredentialController::class, 'document']);
        Route::get('/credentials/{id}/events', [CredentialController::class, 'events']);
    });

    // 4. Company Verifier Dashboard & History
    Route::middleware(['auth:sanctum'])->prefix('companies')->group(function () {
        Route::get('/verifications', [VerificationController::class, 'companyHistory']);
        Route::get('/verifications/{id}', [VerificationController::class, 'companyVerificationDetail']);
    });

    // 5. Platform Administration (Restricted)
    Route::middleware(['auth:sanctum', 'role:platform_admin'])->prefix('admin')->group(function () {
        Route::get('/applications', [PlatformAdminController::class, 'applications']);
        Route::post('/applications/{id}/approve', [PlatformAdminController::class, 'approveApplication']);
        Route::post('/applications/{id}/reject', [PlatformAdminController::class, 'rejectApplication']);
        Route::post('/tenants/{id}/suspend', [PlatformAdminController::class, 'suspendTenant']);
        Route::post('/tenants/{id}/reactivate', [PlatformAdminController::class, 'reactivateTenant']);
        Route::get('/audit-logs', [PlatformAdminController::class, 'auditLogs']);
        Route::get('/health', [PlatformAdminController::class, 'health']);
    });
});

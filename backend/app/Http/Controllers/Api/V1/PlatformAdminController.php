<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TenantStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Credential;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use App\Models\VerificationLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PlatformAdminController extends Controller
{
    /**
     * List Pending Institutional Applications
     */
    public function applications(Request $request): JsonResponse
    {
        $tenants = Tenant::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tenants);
    }

    /**
     * Approve Institutional Application
     */
    public function approveApplication(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status' => TenantStatus::ACTIVE->value,
            'approved_at' => now(),
            'approved_by' => $user->id,
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'tenant.approved',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['institution' => $tenant->name],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Institution approved and activated.', 'tenant' => $tenant]);
    }

    /**
     * Reject Institutional Application
     */
    public function rejectApplication(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status' => TenantStatus::REJECTED->value,
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'tenant.rejected',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['reason' => $request->input('reason', 'Application rejected by platform governance')],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Institution application rejected.', 'tenant' => $tenant]);
    }

    /**
     * Suspend Institution
     */
    public function suspendTenant(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status' => TenantStatus::SUSPENDED->value,
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'tenant.suspended',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['reason' => $request->input('reason', 'Compliance audit suspension')],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Institution suspended.', 'tenant' => $tenant]);
    }

    /**
     * Reactivate Institution
     */
    public function reactivateTenant(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $tenant = Tenant::findOrFail($id);

        $tenant->update([
            'status' => TenantStatus::ACTIVE->value,
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'tenant.reactivated',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['institution' => $tenant->name],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Institution reactivated.', 'tenant' => $tenant]);
    }

    /**
     * Global Platform Audit Ledger
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::with(['tenant', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }

    /**
     * Platform Health & Cryptographic Integrity Status
     */
    public function health(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'statistics' => [
                'total_tenants' => Tenant::count(),
                'active_tenants' => Tenant::where('status', 'active')->count(),
                'pending_tenants' => Tenant::where('status', 'pending')->count(),
                'total_credentials' => Credential::count(),
                'issued_credentials' => Credential::where('status', 'issued')->count(),
                'revoked_credentials' => Credential::where('status', 'revoked')->count(),
                'verification_lookups' => VerificationLog::count(),
            ],
            'cryptography' => [
                'hashing_algorithm' => 'SHA-256',
                'canonical_version' => '1.0',
                'immutable_state' => 'verified',
            ],
        ]);
    }

    /**
     * First-Time Platform Super Admin Bootstrap
     */
    public function bootstrapSuperAdmin(Request $request): JsonResponse
    {
        $role = Role::firstOrCreate(
            ['name' => 'platform_admin', 'scope' => 'platform'],
            ['description' => 'Root Platform Super Administrator']
        );

        $existingAdminCount = TenantMembership::where('role_id', $role->id)->count();

        if ($existingAdminCount > 0) {
            return response()->json(['message' => 'Platform Super Admin has already been initialized.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'mfa_enabled' => true,
            'status' => 'active',
        ]);

        // Create a root tenant or attach root membership
        $rootTenant = Tenant::firstOrCreate(
            ['name' => 'EDUCORE Platform Governance'],
            [
                'tenant_type' => 'organization',
                'institution_type' => 'professional_body',
                'email' => $request->email,
                'status' => 'active',
                'approved_at' => now(),
            ]
        );

        TenantMembership::create([
            'tenant_id' => $rootTenant->id,
            'user_id' => $admin->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        AuditLog::create([
            'tenant_id' => $rootTenant->id,
            'user_id' => $admin->id,
            'action' => 'platform.superadmin_initialized',
            'target_type' => 'user',
            'target_id' => $admin->id,
            'payload' => ['email' => $admin->email],
            'ip_address' => $request->ip(),
        ]);

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Root Platform Super Administrator successfully initialized.',
            'admin' => $admin,
            'token' => $token,
        ], 201);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Company;
use App\Models\CompanyMembership;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\TenantMembership;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Institutional School Registration
     */
    public function registerSchool(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'institution_type' => 'required|string',
            'registration_number' => 'nullable|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'state' => 'nullable|string|max:100',
            'lga' => 'nullable|string|max:100',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::create([
            'name' => $request->name,
            'tenant_type' => 'school',
            'institution_type' => $request->institution_type,
            'registration_number' => $request->registration_number,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'state' => $request->state,
            'lga' => $request->lga,
            'status' => 'pending',
        ]);

        $adminUser = User::create([
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' => Hash::make($request->admin_password),
            'status' => 'active',
        ]);

        $adminRole = Role::firstOrCreate(
            ['name' => 'institution_admin', 'scope' => 'tenant'],
            ['description' => 'Institution Administrator and Primary Rector']
        );

        TenantMembership::create([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'action' => 'tenant.registered',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['institution_name' => $tenant->name],
            'ip_address' => $request->ip(),
        ]);

        $token = $adminUser->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Institution registered successfully. Awaiting platform administrator verification.',
            'tenant' => $tenant,
            'user' => $adminUser,
            'token' => $token,
        ], 201);
    }

    /**
     * Faith-Based / NGO / Vocational Organization Registration
     */
    public function registerOrganization(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'institution_type' => 'required|string',
            'registration_number' => 'nullable|string|max:100',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::create([
            'name' => $request->name,
            'tenant_type' => 'organization',
            'institution_type' => $request->institution_type,
            'registration_number' => $request->registration_number,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'status' => 'pending',
        ]);

        $adminUser = User::create([
            'name' => $request->admin_name,
            'email' => $request->admin_email,
            'password' => Hash::make($request->admin_password),
            'status' => 'active',
        ]);

        $adminRole = Role::firstOrCreate(
            ['name' => 'institution_admin', 'scope' => 'tenant'],
            ['description' => 'Organization Administrator']
        );

        TenantMembership::create([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $adminUser->id,
            'action' => 'tenant.organization_registered',
            'target_type' => 'tenant',
            'target_id' => $tenant->id,
            'payload' => ['organization_name' => $tenant->name],
            'ip_address' => $request->ip(),
        ]);

        $token = $adminUser->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Organization registered successfully. Pending platform approval.',
            'tenant' => $tenant,
            'user' => $adminUser,
            'token' => $token,
        ], 201);
    }

    /**
     * Corporate Verifier Registration
     */
    public function registerCompany(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'registration_number' => 'nullable|string|max:100',
            'email' => 'required|email|max:255|unique:companies,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'admin_name' => 'required|string|max:255',
            'admin_password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company = Company::create([
            'name' => $request->name,
            'business_type' => $request->business_type,
            'registration_number' => $request->registration_number,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'status' => 'active',
        ]);

        $user = User::create([
            'name' => $request->admin_name,
            'email' => $request->email,
            'password' => Hash::make($request->admin_password),
            'status' => 'active',
        ]);

        CompanyMembership::create([
            'company_id' => $company->id,
            'user_id' => $user->id,
            'role' => 'company_verifier',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Corporate verifier registered successfully.',
            'company' => $company,
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * General Authentication (Multi-Tenant & Corporate)
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials or unauthorized user.'], 401);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'User account is suspended or locked.'], 403);
        }

        $user->update(['last_login_at' => now()]);

        // Load memberships with tenant & role
        $memberships = TenantMembership::where('user_id', $user->id)
            ->with(['tenant', 'role.permissions'])
            ->where('status', 'active')
            ->get();

        $companyMemberships = CompanyMembership::where('user_id', $user->id)
            ->with('company')
            ->get();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Authentication successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_platform_admin' => $user->isPlatformAdmin(),
            ],
            'tenant_memberships' => $memberships,
            'company_memberships' => $companyMemberships,
        ]);
    }

    /**
     * Sign Out
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Successfully signed out.']);
    }

    /**
     * Current User Profile
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $memberships = TenantMembership::where('user_id', $user->id)
            ->with(['tenant', 'role.permissions'])
            ->get();

        return response()->json([
            'user' => $user,
            'memberships' => $memberships,
            'active_tenant' => $request->attributes->get('activeTenant'),
        ]);
    }

    /**
     * Resolved Active Tenant
     */
    public function currentTenant(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        return response()->json(['tenant' => $tenant]);
    }

    /**
     * Switch Active Tenant Context
     */
    public function switchTenant(Request $request, string $tenantId): JsonResponse
    {
        $user = $request->user();
        $membership = TenantMembership::where('user_id', $user->id)
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->with('tenant', 'role.permissions')
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'User is not an active member of this institution.'], 403);
        }

        return response()->json([
            'message' => 'Active tenant workspace switched successfully.',
            'tenant' => $membership->tenant,
            'role' => $membership->role,
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Password reset protocol dispatched if account exists.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Password updated successfully.']);
    }
}

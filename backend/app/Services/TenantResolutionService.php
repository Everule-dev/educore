<?php

namespace App\Services;

use App\Enums\TenantStatus;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TenantResolutionService
{
    /**
     * Resolve the active tenant from authenticated user membership and session context.
     * Never trusts a client-submitted tenant_id header alone.
     */
    public function resolveTenant(Request $request, object $user): object
    {
        // 1. Get requested tenant_id from header or session
        $requestedTenantId = $request->header('X-Tenant-ID') ?: $request->session()->get('active_tenant_id');

        // 2. Query user's authorized memberships
        $memberships = $user->tenantMemberships()
            ->with('tenant', 'role')
            ->where('status', 'active')
            ->get();

        if ($memberships->isEmpty()) {
            throw new AccessDeniedHttpException('User does not belong to any active institution.');
        }

        // 3. Match requested or pick primary
        $activeMembership = null;
        if ($requestedTenantId) {
            $activeMembership = $memberships->first(function ($m) use ($requestedTenantId) {
                return $m->tenant_id === $requestedTenantId;
            });

            if (!$activeMembership) {
                throw new AccessDeniedHttpException('403 Forbidden: User is not authorized to access the requested institution tenant.');
            }
        } else {
            $activeMembership = $memberships->first();
        }

        $tenant = $activeMembership->tenant;

        $tenantStatus = $tenant && $tenant->status instanceof TenantStatus ? $tenant->status->value : (string) ($tenant->status ?? '');

        if (!$tenant || $tenantStatus !== TenantStatus::ACTIVE->value) {
            throw new AccessDeniedHttpException('The institution account is pending approval or suspended.');
        }

        return $tenant;
    }

    /**
     * Assert that the requested resource belongs strictly to the tenant context.
     */
    public function assertBelongsToTenant(string $resourceTenantId, string $activeTenantId): void
    {
        if ($resourceTenantId !== $activeTenantId) {
            throw new NotFoundHttpException('Resource not found.');
        }
    }
}

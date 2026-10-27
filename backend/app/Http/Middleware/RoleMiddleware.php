<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Platform Admin bypass/direct role check
        if (in_array('platform_admin', $roles, true)) {
            if ($user->isPlatformAdmin()) {
                return $next($request);
            }
            return response()->json(['message' => 'Restricted to Platform Administrators.'], 403);
        }

        // Tenant-scoped role check
        $activeTenant = $request->attributes->get('activeTenant');
        if ($activeTenant) {
            foreach ($roles as $role) {
                if ($user->hasRoleInTenant($role, $activeTenant->id)) {
                    return $next($request);
                }
            }
            return response()->json([
                'message' => 'User does not possess the required permissions for this action.',
            ], 403);
        }

        return response()->json(['message' => 'Forbidden.'], 403);
    }
}

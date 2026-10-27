<?php

namespace App\Http\Middleware;

use App\Services\TenantResolutionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantContextMiddleware
{
    protected TenantResolutionService $resolver;

    public function __construct(TenantResolutionService $resolver)
    {
        $this->resolver = $resolver;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        try {
            $tenant = $this->resolver->resolveTenant($request, $user);
            $request->attributes->set('activeTenant', $tenant);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'Unauthorized access to institutional workspace.',
            ], 403);
        }

        return $next($request);
    }
}

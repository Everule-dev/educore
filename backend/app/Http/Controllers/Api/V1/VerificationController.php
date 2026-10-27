<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\VerificationResult;
use App\Http\Controllers\Controller;
use App\Models\CompanyMembership;
use App\Models\Credential;
use App\Models\VerificationLog;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    protected VerificationService $verificationService;

    public function __construct(VerificationService $verificationService)
    {
        $this->verificationService = $verificationService;
    }

    /**
     * Universal Public Verification Endpoint (POST /api/v1/verify)
     */
    public function verify(Request $request): JsonResponse
    {
        $query = trim((string)($request->input('query') ?: $request->input('hash') ?: $request->input('verification_id')));

        if (!$query) {
            return response()->json(['message' => 'Query parameter or hash fingerprint is required.'], 400);
        }

        // Clean raw input (in case URL was passed from QR code)
        if (str_contains($query, 'http://') || str_contains($query, 'https://')) {
            $parsedUrl = parse_url($query);
            if (isset($parsedUrl['query'])) {
                parse_str($parsedUrl['query'], $queryParams);
                $query = $queryParams['id'] ?? $queryParams['query'] ?? $queryParams['hash'] ?? $query;
            } else {
                $segments = array_filter(explode('/', $parsedUrl['path'] ?? ''));
                if (!empty($segments)) {
                    $query = end($segments);
                }
            }
        }

        $credential = Credential::where('verification_id', $query)
            ->orWhere('credential_hash', strtolower($query))
            ->orWhere('credential_number', $query)
            ->with('tenant')
            ->first();

        $companyId = null;
        $requesterCategory = 'public';

        $user = $request->user();
        if ($user) {
            $companyMembership = CompanyMembership::where('user_id', $user->id)->first();
            if ($companyMembership) {
                $companyId = $companyMembership->company_id;
                $requesterCategory = 'company';
            }
        }

        if (!$credential) {
            $response = $this->verificationService->formatPublicResponse(VerificationResult::NOT_FOUND);

            VerificationLog::create([
                'credential_id' => null,
                'lookup_type' => strlen($query) === 64 ? 'hash' : 'verification_id',
                'lookup_value' => $query,
                'result' => VerificationResult::NOT_FOUND->value,
                'requester_category' => $requesterCategory,
                'company_id' => $companyId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
            ]);

            return response()->json($response, 200);
        }

        $result = $this->verificationService->evaluateRecord($credential);
        $response = $this->verificationService->formatPublicResponse(
            $result,
            $credential,
            $credential->tenant,
            now()->toIso8601String()
        );

        VerificationLog::create([
            'credential_id' => $credential->id,
            'lookup_type' => strlen($query) === 64 ? 'hash' : 'verification_id',
            'lookup_value' => $query,
            'result' => $result->value,
            'requester_category' => $requesterCategory,
            'company_id' => $companyId,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return response()->json($response, 200);
    }

    /**
     * Public QR Code Direct Query (GET /api/v1/verify/{verification_id})
     */
    public function verifyById(Request $request, string $verification_id): JsonResponse
    {
        $request->merge(['query' => $verification_id]);
        return $this->verify($request);
    }

    /**
     * Corporate Verifier Verification Audit Trail
     */
    public function companyHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyMembership = CompanyMembership::where('user_id', $user->id)->first();

        if (!$companyMembership) {
            return response()->json(['message' => 'Unauthorized. User does not belong to a corporate verifier.'], 403);
        }

        $logs = VerificationLog::where('company_id', $companyMembership->company_id)
            ->with('credential')
            ->orderBy('created_at', 'desc')
            ->paginate(25);

        return response()->json($logs);
    }

    /**
     * Specific Corporate Verification Audit Detail
     */
    public function companyVerificationDetail(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $companyMembership = CompanyMembership::where('user_id', $user->id)->first();

        if (!$companyMembership) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $log = VerificationLog::where('id', $id)
            ->where('company_id', $companyMembership->company_id)
            ->with(['credential.tenant'])
            ->firstOrFail();

        return response()->json($log);
    }
}

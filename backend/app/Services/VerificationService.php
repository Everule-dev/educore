<?php

namespace App\Services;

use App\Enums\CredentialStatus;
use App\Enums\VerificationResult;

class VerificationService
{
    protected CredentialService $credentialService;

    public function __construct(CredentialService $credentialService)
    {
        $this->credentialService = $credentialService;
    }

    /**
     * Build privacy-safe public verification response.
     * Guaranteed never to leak private student data (DOB, NIN, address, phone).
     */
    public function formatPublicResponse(
        VerificationResult $result,
        ?object $credential = null,
        ?object $tenant = null,
        ?string $checkedAt = null
    ): array {
        $timestamp = $checkedAt ?? (function_exists('now') ? now()->toIso8601String() : date('c'));

        if ($result === VerificationResult::NOT_FOUND || !$credential) {
            return [
                'result' => VerificationResult::NOT_FOUND->value,
                'status' => 'not_found',
                'message' => 'No authoritative record matching the provided reference exists on EDUCORE.',
                'verification' => [
                    'checked_at' => $timestamp,
                ],
            ];
        }

        $status = $credential->status instanceof CredentialStatus ? $credential->status->value : (string)($credential->status ?? '');
        $issuedAt = $credential->issued_at instanceof \DateTimeInterface
            ? $credential->issued_at->toIso8601String()
            : (string)($credential->issued_at ?? '');

        $tenantStatus = isset($tenant->status) && $tenant->status instanceof \App\Enums\TenantStatus
            ? $tenant->status->value
            : (string)($tenant->status ?? 'active');

        $tenantType = isset($tenant->tenant_type) && $tenant->tenant_type instanceof \App\Enums\TenantType
            ? $tenant->tenant_type->value
            : (string)($tenant->institution_type ?? 'traditional');

        $base = [
            'result' => $result->value,
            'status' => $status,
            'credential' => [
                'verification_id' => $credential->verification_id,
                'credential_number' => $credential->credential_number,
                'title' => $credential->title,
                'credential_type' => $credential->credential_type,
                'recipient_name' => $credential->recipient_name,
                'issuer_name' => $tenant->name ?? 'Verified Institution',
                'issuer_type' => $tenantType,
                'issuer_status' => $tenantStatus,
                'issued_at' => $issuedAt,
            ],
            'verification' => [
                'hash_algorithm' => $credential->hash_algorithm ?? 'SHA-256',
                'credential_hash' => $credential->credential_hash,
                'checked_at' => $timestamp,
                'integrity_verified' => $result === VerificationResult::VALID,
            ],
        ];

        if ($result === VerificationResult::REVOKED) {
            $base['revocation'] = [
                'is_revoked' => true,
                'reason' => $credential->revocation_reason ?? 'Revoked by issuing authority',
            ];
        }

        if ($result === VerificationResult::SUPERSEDED) {
            $base['superseded'] = [
                'is_superseded' => true,
                'notice' => 'This credential has been superseded by an updated issuance.',
            ];
        }

        return $base;
    }

    /**
     * Evaluate integrity of credential record.
     */
    public function evaluateRecord(object $credential): VerificationResult
    {
        $status = $credential->status instanceof CredentialStatus ? $credential->status->value : (string)($credential->status ?? '');

        if ($status === CredentialStatus::REVOKED->value) {
            return VerificationResult::REVOKED;
        }

        if ($status === CredentialStatus::SUPERSEDED->value) {
            return VerificationResult::SUPERSEDED;
        }

        if ($status !== CredentialStatus::ISSUED->value) {
            return VerificationResult::INVALID;
        }

        $issuedAt = $credential->issued_at instanceof \DateTimeInterface
            ? $credential->issued_at->toIso8601String()
            : (string)($credential->issued_at ?? '');

        // Recompute canonical hash to verify against tampering
        $canonical = $this->credentialService->generateCanonicalPayload([
            'credential_number' => $credential->credential_number,
            'credential_type' => $credential->credential_type,
            'description' => $credential->description,
            'issued_at' => $issuedAt,
            'issuer_tenant_id' => $credential->tenant_id,
            'recipient_id' => $credential->recipient_id,
            'recipient_name' => $credential->recipient_name,
            'recipient_type' => $credential->recipient_type,
            'title' => $credential->title,
        ]);

        $calculatedHash = $this->credentialService->computeHash($canonical);

        if (!hash_equals($credential->credential_hash ?? '', $calculatedHash)) {
            return VerificationResult::INVALID;
        }

        return VerificationResult::VALID;
    }
}

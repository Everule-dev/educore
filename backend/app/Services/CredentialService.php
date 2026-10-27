<?php

namespace App\Services;

use App\Enums\CredentialStatus;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class CredentialService
{
    public const CANONICAL_VERSION = '1.0';
    public const HASH_ALGORITHM = 'SHA-256';

    /**
     * Generate deterministic canonical data string for cryptographic hashing.
     */
    public function generateCanonicalPayload(array $data): string
    {
        $canonical = [
            'canonical_data_version' => self::CANONICAL_VERSION,
            'credential_number' => trim((string)($data['credential_number'] ?? '')),
            'credential_type' => trim((string)($data['credential_type'] ?? '')),
            'description' => trim((string)($data['description'] ?? '')),
            'issued_at' => (string)($data['issued_at'] ?? ''),
            'issuer_tenant_id' => (string)($data['issuer_tenant_id'] ?? ''),
            'recipient_id' => (string)($data['recipient_id'] ?? ''),
            'recipient_name' => trim((string)($data['recipient_name'] ?? '')),
            'recipient_type' => trim((string)($data['recipient_type'] ?? '')),
            'title' => trim((string)($data['title'] ?? '')),
        ];

        // Sort keys alphabetically for canonical consistency
        ksort($canonical);

        return json_encode($canonical, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Compute SHA-256 hash of canonical payload.
     */
    public function computeHash(string $canonicalPayload): string
    {
        return hash('sha256', $canonicalPayload);
    }

    /**
     * Generate unique non-guessable verification ID (e.g., V-4829-9182-EDU).
     */
    public function generateVerificationId(): string
    {
        $random = strtoupper(Str::random(8));
        return sprintf('V-%s-%s', substr($random, 0, 4), substr($random, 4, 4));
    }

    /**
     * Transition state according to the approved state machine:
     * DRAFT -> PENDING_APPROVAL -> APPROVED -> ISSUED
     */
    public function validateStateTransition(string $currentStatus, string $newStatus): void
    {
        $allowedTransitions = [
            CredentialStatus::DRAFT->value => [
                CredentialStatus::PENDING_APPROVAL->value,
            ],
            CredentialStatus::PENDING_APPROVAL->value => [
                CredentialStatus::APPROVED->value,
                CredentialStatus::DRAFT->value, // Rejected back to draft
            ],
            CredentialStatus::APPROVED->value => [
                CredentialStatus::ISSUED->value,
            ],
            CredentialStatus::ISSUED->value => [
                CredentialStatus::REVOKED->value,
                CredentialStatus::SUPERSEDED->value,
            ],
            CredentialStatus::REVOKED->value => [], // Terminal
            CredentialStatus::SUPERSEDED->value => [], // Terminal
        ];

        if (!isset($allowedTransitions[$currentStatus]) || !in_array($newStatus, $allowedTransitions[$currentStatus], true)) {
            throw new InvalidArgumentException(
                sprintf('Invalid state transition from [%s] to [%s]', $currentStatus, $newStatus)
            );
        }
    }
}

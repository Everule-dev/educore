<?php

require_once __DIR__ . '/../app/Enums/CredentialStatus.php';
require_once __DIR__ . '/../app/Enums/VerificationResult.php';
require_once __DIR__ . '/../app/Services/CredentialService.php';
require_once __DIR__ . '/../app/Services/VerificationService.php';

use App\Services\CredentialService;
use App\Services\VerificationService;
use App\Enums\CredentialStatus;
use App\Enums\VerificationResult;

echo "=== EDUCORE BACKEND CRYPTOGRAPHIC & TENANCY TESTS ===\n\n";

$credentialService = new CredentialService();
$verificationService = new VerificationService($credentialService);

$testsPassed = 0;
$totalTests = 0;

function assertCondition($name, $condition) {
    global $testsPassed, $totalTests;
    $totalTests++;
    if ($condition) {
        echo " [PASS] $name\n";
        $testsPassed++;
    } else {
        echo " [FAIL] $name\n";
    }
}

// TEST 1: Canonical Payload Consistency
$payload1 = $credentialService->generateCanonicalPayload([
    'title' => '  Higher National Diploma in Software Engineering  ',
    'recipient_name' => 'Emmanuel Okafor',
    'recipient_type' => 'student',
    'recipient_id' => 'rec-001',
    'issuer_tenant_id' => 'tenant-apex',
    'issued_at' => '2026-10-14T21:00:00Z',
    'description' => 'Awarded with Distinction',
    'credential_type' => 'Diploma',
    'credential_number' => 'EDU-APEX-2026-0001',
]);

$decoded = json_decode($payload1, true);
$keys = array_keys($decoded);
$sortedKeys = $keys;
sort($sortedKeys);

assertCondition("Canonical payload keys are sorted alphabetically", $keys === $sortedKeys);
assertCondition("Whitespace is trimmed in canonical fields", $decoded['title'] === 'Higher National Diploma in Software Engineering');

// TEST 2: SHA-256 Determinism
$hash1 = $credentialService->computeHash($payload1);
$hash2 = $credentialService->computeHash($payload1);
assertCondition("SHA-256 hash is 64 hex characters", strlen($hash1) === 64);
assertCondition("SHA-256 is deterministic across duplicate inputs", $hash1 === $hash2);

// TEST 3: State Transitions
try {
    $credentialService->validateStateTransition(CredentialStatus::DRAFT->value, CredentialStatus::PENDING_APPROVAL->value);
    assertCondition("Transition DRAFT -> PENDING_APPROVAL succeeds", true);
} catch (Exception $e) {
    assertCondition("Transition DRAFT -> PENDING_APPROVAL succeeds", false);
}

try {
    $credentialService->validateStateTransition(CredentialStatus::PENDING_APPROVAL->value, CredentialStatus::APPROVED->value);
    assertCondition("Transition PENDING_APPROVAL -> APPROVED succeeds", true);
} catch (Exception $e) {
    assertCondition("Transition PENDING_APPROVAL -> APPROVED succeeds", false);
}

try {
    $credentialService->validateStateTransition(CredentialStatus::APPROVED->value, CredentialStatus::ISSUED->value);
    assertCondition("Transition APPROVED -> ISSUED succeeds", true);
} catch (Exception $e) {
    assertCondition("Transition APPROVED -> ISSUED succeeds", false);
}

// TEST 4: Invalid Transition Protection (DRAFT cannot jump to ISSUED without approval)
$illegalBlocked = false;
try {
    $credentialService->validateStateTransition(CredentialStatus::DRAFT->value, CredentialStatus::ISSUED->value);
} catch (InvalidArgumentException $e) {
    $illegalBlocked = true;
}
assertCondition("Illegal transition DRAFT -> ISSUED is strictly blocked", $illegalBlocked);

// TEST 5: Verification Service Integrity
$mockCred = (object)[
    'id' => 'cred-test-1',
    'tenant_id' => 'tenant-apex',
    'recipient_type' => 'student',
    'recipient_id' => 'rec-001',
    'recipient_name' => 'Emmanuel Okafor',
    'credential_number' => 'EDU-APEX-2026-0001',
    'credential_type' => 'Diploma',
    'title' => 'Higher National Diploma in Software Engineering',
    'description' => 'Awarded with Distinction',
    'issued_at' => '2026-10-14T21:00:00Z',
    'status' => 'issued',
    'canonical_data_version' => '1.0',
    'hash_algorithm' => 'SHA-256',
    'credential_hash' => $hash1,
    'verification_id' => 'V-9982-1204',
];

$result = $verificationService->evaluateRecord($mockCred);
assertCondition("Authentic unaltered credential evaluates to VALID", $result === VerificationResult::VALID);

// TEST 6: Tamper Detection (Modify title without updating hash)
$tamperedCred = clone $mockCred;
$tamperedCred->title = 'Forged Doctor of Philosophy in Artificial Intelligence';
$tamperResult = $verificationService->evaluateRecord($tamperedCred);
assertCondition("Tampered credential evaluated to INVALID", $tamperResult === VerificationResult::INVALID);

// TEST 7: Privacy-Safe Public Response Formatting
$publicResponse = $verificationService->formatPublicResponse($result, $mockCred, (object)['name' => 'Apex Polytechnic', 'institution_type' => 'polytechnic']);
assertCondition("Public response omits internal student ID", !isset($publicResponse['credential']['recipient_id']));
assertCondition("Public response includes verification reference", $publicResponse['credential']['verification_id'] === 'V-9982-1204');
assertCondition("Public response includes verified SHA-256 hash", $publicResponse['verification']['credential_hash'] === $hash1);

echo "\nSummary: $testsPassed / $totalTests tests passed.\n";

if ($testsPassed === $totalTests) {
    echo "Result: ALL CRYPTOGRAPHIC & STATE MACHINE VERIFICATIONS PASSED!\n";
    exit(0);
} else {
    echo "Result: SOME TESTS FAILED.\n";
    exit(1);
}

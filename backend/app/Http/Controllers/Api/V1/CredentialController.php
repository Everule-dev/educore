<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CredentialStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Credential;
use App\Models\CredentialEvent;
use App\Models\Student;
use App\Services\CredentialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CredentialController extends Controller
{
    protected CredentialService $credentialService;

    public function __construct(CredentialService $credentialService)
    {
        $this->credentialService = $credentialService;
    }

    /**
     * List credentials within active tenant context
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $query = Credential::where('tenant_id', $tenant->id)
            ->with(['issuer', 'approver'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('recipient_name', 'like', $term)
                  ->orWhere('credential_number', 'like', $term)
                  ->orWhere('verification_id', 'like', $term)
                  ->orWhere('title', 'like', $term);
            });
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Create a new credential draft
     */
    public function store(Request $request): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'recipient_type' => 'required|in:student,trainee,member,staff',
            'recipient_id' => 'required|string',
            'recipient_name' => 'required|string|max:255',
            'credential_type' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generate tenant-prefixed credential number
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $tenant->registration_number ?: $tenant->name), 0, 4)) ?: 'EDU';
        $seq = Credential::where('tenant_id', $tenant->id)->count() + 1;
        $credentialNumber = sprintf('%s-%s-%05d', $prefix, date('Y'), $seq);
        $verificationId = $this->credentialService->generateVerificationId();

        $credential = DB::transaction(function () use ($tenant, $user, $request, $credentialNumber, $verificationId) {
            $cred = Credential::create([
                'tenant_id' => $tenant->id,
                'recipient_type' => $request->recipient_type,
                'recipient_id' => $request->recipient_id,
                'recipient_name' => $request->recipient_name,
                'credential_number' => $credentialNumber,
                'credential_type' => $request->credential_type,
                'title' => $request->title,
                'description' => $request->description,
                'issuer_user_id' => $user->id,
                'status' => CredentialStatus::DRAFT->value,
                'canonical_data_version' => CredentialService::CANONICAL_VERSION,
                'hash_algorithm' => CredentialService::HASH_ALGORITHM,
                'verification_id' => $verificationId,
            ]);

            CredentialEvent::create([
                'credential_id' => $cred->id,
                'event_type' => 'created',
                'actor_id' => $user->id,
                'reason' => 'Draft certificate initiated',
                'created_at' => now(),
            ]);

            return $cred;
        });

        return response()->json([
            'message' => 'Credential draft initialized.',
            'credential' => $credential,
        ], 201);
    }

    /**
     * Show credential details with strict tenant boundary check
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->with(['issuer', 'approver', 'events.actor'])
            ->firstOrFail();

        return response()->json($credential);
    }

    /**
     * Update draft credential
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($credential->status !== CredentialStatus::DRAFT) {
            return response()->json(['message' => 'Only draft credentials can be edited.'], 400);
        }

        $credential->update($request->only([
            'title',
            'description',
            'recipient_name',
            'credential_type',
        ]));

        return response()->json(['message' => 'Draft updated.', 'credential' => $credential]);
    }

    /**
     * Submit draft for approval
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->credentialService->validateStateTransition(
            $credential->status->value,
            CredentialStatus::PENDING_APPROVAL->value
        );

        $credential->update(['status' => CredentialStatus::PENDING_APPROVAL->value]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'submitted',
            'actor_id' => $user->id,
            'reason' => 'Submitted for two-person integrity approval',
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Submitted for administrative approval.', 'credential' => $credential]);
    }

    /**
     * Two-Person Rule Approval (Approver must be distinct from submitter/creator)
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($credential->issuer_user_id === $user->id) {
            return response()->json([
                'message' => 'Two-person review violation: The issuing author cannot approve their own credential issuance.',
            ], 422);
        }

        $this->credentialService->validateStateTransition(
            $credential->status->value,
            CredentialStatus::APPROVED->value
        );

        $credential->update([
            'status' => CredentialStatus::APPROVED->value,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'approved',
            'actor_id' => $user->id,
            'reason' => 'Credential verified and approved by governing signatory',
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Credential approved successfully.', 'credential' => $credential]);
    }

    /**
     * Reject back to draft
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $credential->update(['status' => CredentialStatus::DRAFT->value]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'rejected',
            'actor_id' => $user->id,
            'reason' => $request->input('reason', 'Returned to draft by approver for revision'),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Credential returned to draft.', 'credential' => $credential]);
    }

    /**
     * Final Cryptographic Issuance (Binds SHA-256 Canonical Fingerprint)
     */
    public function issue(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->credentialService->validateStateTransition(
            $credential->status->value,
            CredentialStatus::ISSUED->value
        );

        $issuedAt = now()->toIso8601String();

        // 1. Generate canonical JSON payload
        $canonicalPayload = $this->credentialService->generateCanonicalPayload([
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

        // 2. Compute SHA-256 fingerprint
        $credentialHash = $this->credentialService->computeHash($canonicalPayload);

        // 3. Commit issuance
        $credential->update([
            'status' => CredentialStatus::ISSUED->value,
            'issued_at' => $issuedAt,
            'credential_hash' => $credentialHash,
            'hash_algorithm' => CredentialService::HASH_ALGORITHM,
            'canonical_data_version' => CredentialService::CANONICAL_VERSION,
        ]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'issued',
            'actor_id' => $user->id,
            'reason' => 'Cryptographic SHA-256 hash calculated and sealed onto ledger',
            'metadata' => [
                'hash' => $credentialHash,
                'algorithm' => 'SHA-256',
                'verification_id' => $credential->verification_id,
            ],
            'created_at' => now(),
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'credential.issued',
            'target_type' => 'credential',
            'target_id' => $credential->id,
            'payload' => [
                'verification_id' => $credential->verification_id,
                'hash' => $credentialHash,
            ],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Credential issued and cryptographically sealed.',
            'credential' => $credential,
            'credential_hash' => $credentialHash,
        ]);
    }

    /**
     * Stamped Revocation
     */
    public function revoke(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $request->validate(['reason' => 'required|string|min:5']);

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $this->credentialService->validateStateTransition(
            $credential->status->value,
            CredentialStatus::REVOKED->value
        );

        $credential->update([
            'status' => CredentialStatus::REVOKED->value,
            'revocation_reason' => $request->reason,
        ]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'revoked',
            'actor_id' => $user->id,
            'reason' => $request->reason,
            'created_at' => now(),
        ]);

        AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'action' => 'credential.revoked',
            'target_type' => 'credential',
            'target_id' => $credential->id,
            'payload' => ['reason' => $request->reason],
            'ip_address' => $request->ip(),
        ]);

        return response()->json(['message' => 'Credential permanently revoked.', 'credential' => $credential]);
    }

    /**
     * Supersede Credential
     */
    public function supersede(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $user = $request->user();

        $request->validate(['supersedes_credential_id' => 'required|uuid']);

        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        $credential->update([
            'status' => CredentialStatus::SUPERSEDED->value,
            'supersedes_credential_id' => $request->supersedes_credential_id,
        ]);

        CredentialEvent::create([
            'credential_id' => $credential->id,
            'event_type' => 'superseded',
            'actor_id' => $user->id,
            'reason' => 'Superseded by updated issuance ' . $request->supersedes_credential_id,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Credential status set to superseded.', 'credential' => $credential]);
    }

    /**
     * View Certificate Document Details
     */
    public function document(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->with(['tenant', 'issuer', 'approver'])
            ->firstOrFail();

        return response()->json([
            'credential' => $credential,
            'canonical_hash' => $credential->credential_hash,
            'verification_qr_payload' => sprintf('https://educore.org/verify?id=%s', $credential->verification_id),
        ]);
    }

    /**
     * Credential Lifecycle Audit Trail
     */
    public function events(Request $request, string $id): JsonResponse
    {
        $tenant = $request->attributes->get('activeTenant');
        $credential = Credential::where('tenant_id', $tenant->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($credential->events()->with('actor')->get());
    }
}

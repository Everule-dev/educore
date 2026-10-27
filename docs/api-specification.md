# EDUCORE - API Specification (v1)

**Base URL:** `/api/v1`  
**Content-Type:** `application/json`  
**Authorization:** Bearer token (Laravel Sanctum) or secure session cookie

---

## 1. Authentication & Tenant Context

### `POST /auth/register/school`
Register a new traditional or informal institution.
```json
// Request
{
  "tenant_name": "Apex Polytechnic",
  "institution_type": "vocational",
  "registration_number": "RC-998812",
  "admin_name": "Dr. Sarah Obi",
  "email": "admin@apexpoly.edu.ng",
  "password": "SecurePassword#2026",
  "phone": "+2348012345678",
  "state": "Lagos",
  "lga": "Ikeja"
}
// Response (201 Created)
{
  "message": "Institution registered successfully and pending administrative review.",
  "tenant_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "status": "pending"
}
```

### `POST /auth/register/company`
Register an enterprise verifier account.
```json
// Request
{
  "company_name": "Zenith Global Consulting",
  "business_type": "Human Resources & Recruiting",
  "registration_number": "RC-112233",
  "contact_name": "Alex Vance",
  "email": "alex@zenithconsulting.com",
  "password": "SecurePassword#2026"
}
// Response (201 Created)
{
  "message": "Company registered successfully.",
  "company_id": "7c1deb4d-1b2d-3cad-8bee-1a0d7b3dca1a"
}
```

### `POST /auth/login`
```json
// Request
{
  "email": "admin@apexpoly.edu.ng",
  "password": "SecurePassword#2026"
}
// Response (200 OK)
{
  "token": "1|sanctum_token_string_here",
  "user": {
    "id": "e83d81b4-7b81-42e6-a249-1e3d3f9b2d10",
    "name": "Dr. Sarah Obi",
    "email": "admin@apexpoly.edu.ng"
  },
  "tenants": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Apex Polytechnic",
      "tenant_type": "school",
      "role": "institution_admin",
      "status": "active"
    }
  ]
}
```

### `POST /tenants/{tenant}/switch`
Sets active tenant context for subsequent queries.

---

## 2. Credential Lifecycle Endpoints

### `POST /credentials`
Draft a new credential.
```json
// Request
{
  "recipient_type": "student",
  "recipient_id": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
  "recipient_name": "Emmanuel Okafor",
  "credential_type": "diploma",
  "title": "National Diploma in Software Engineering",
  "description": "Graduated with Distinction in Web Architecture"
}
// Response (201 Created)
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "draft",
  "verification_id": "V-9982-1204"
}
```

### `POST /credentials/{id}/submit`
Submits draft credential for approval. Changes status to `pending_approval`.

### `POST /credentials/{id}/approve`
Approver approves issuance. Changes status to `approved`.

### `POST /credentials/{id}/issue`
Computes canonical SHA-256 fingerprint, finalizes verification ID, generates certificate PDF, and stamps issuance timestamp.
```json
// Response (200 OK)
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "issued",
  "credential_number": "EDU-APEX-2026-00412",
  "verification_id": "V-9982-1204",
  "hash_algorithm": "SHA-256",
  "credential_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
  "issued_at": "2026-10-14T21:00:00Z",
  "qr_url": "https://educore.org/verify/V-9982-1204"
}
```

### `POST /credentials/{id}/revoke`
Revoke an issued credential with an audit reason. Status becomes `revoked`.

### `POST /credentials/{id}/supersede`
Marks current credential as `superseded` and creates a linked revision.

---

## 3. Universal Verification (Public & Company)

### `POST /verify`
Universal verification query accepting multiple identifier formats.
```json
// Request
{
  "type": "verification_id", // or "hash"
  "value": "V-9982-1204"
}

// Response (200 OK - Privacy Safe)
{
  "result": "VALID",
  "status": "issued",
  "credential": {
    "title": "National Diploma in Software Engineering",
    "credential_type": "diploma",
    "credential_number": "EDU-APEX-2026-00412",
    "issuer_name": "Apex Polytechnic",
    "issuer_type": "vocational",
    "recipient_name": "Emmanuel Okafor",
    "issued_at": "2026-10-14"
  },
  "verification": {
    "hash_algorithm": "SHA-256",
    "credential_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
    "verified_at": "2026-10-14T21:05:00Z"
  }
}
```
*Note: Private student numbers, date of birth, personal address, and internal comments are omitted from the public verification response.*

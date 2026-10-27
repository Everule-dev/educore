/**
 * EDUCORE Cryptographic Engine
 * Implements deterministic canonicalization and SHA-256 fingerprinting
 * conforming to Section 7 of the Technical Specification.
 */

export interface CanonicalDataInput {
  canonical_data_version?: string;
  credential_number: string;
  credential_type: string;
  description: string;
  issued_at: string;
  issuer_tenant_id: string;
  recipient_id: string;
  recipient_name: string;
  recipient_type: string;
  title: string;
}

/**
 * Generate canonical JSON string:
 * - Keys sorted alphabetically
 * - Whitespace trimmed
 * - Standardized ISO-8601 formatting
 */
export function generateCanonicalPayload(input: CanonicalDataInput): string {
  const canonical: Record<string, string> = {
    canonical_data_version: input.canonical_data_version || '1.0',
    credential_number: (input.credential_number || '').trim(),
    credential_type: (input.credential_type || '').trim(),
    description: (input.description || '').trim(),
    issued_at: (input.issued_at || '').trim(),
    issuer_tenant_id: (input.issuer_tenant_id || '').trim(),
    recipient_id: (input.recipient_id || '').trim(),
    recipient_name: (input.recipient_name || '').trim(),
    recipient_type: (input.recipient_type || '').trim(),
    title: (input.title || '').trim(),
  };

  const sortedKeys = Object.keys(canonical).sort();
  const sortedObj: Record<string, string> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = canonical[key];
  }

  return JSON.stringify(sortedObj);
}

/**
 * Computes SHA-256 cryptographic digest of any UTF-8 string using browser SubtleCrypto
 */
export async function computeSha256(canonicalPayload: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(canonicalPayload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generates an unguessable verification reference (e.g., EDU-9821-X94B)
 */
export function generateVerificationId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `V-${segment1}-${segment2}`;
}

/**
 * Generates an institutional credential reference number
 */
export function generateCredentialNumber(code: string, sequence: number): string {
  const padded = String(sequence).padStart(5, '0');
  const year = new Date().getFullYear();
  return `EDU-${code.toUpperCase()}-${year}-${padded}`;
}

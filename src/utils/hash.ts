// ================================================================
// FILE: src/utils/hash.ts
// PURPOSE: Small SHA-256 helper used in export metadata.
// DEPENDENCIES: Web Crypto API
// ================================================================

/**
 * Compute a SHA-256 digest for a string and return a hex value.
 *
 * @param value - Input text.
 * @returns Hex-encoded digest.
 */
export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

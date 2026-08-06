import crypto from 'crypto';

/**
 * Constant-time string comparison for HMAC/webhook signatures.
 *
 * Guardian audit INFO "Webhook Signature Comparison": shield.js and institutional.js
 * were both comparing NOWPayments HMAC signatures with plain `!==`, which short-
 * circuits on the first differing byte. The audit correctly notes the real-world risk
 * of that over the internet is negligible (network jitter swamps a byte-level timing
 * signal long before it reaches an attacker), but it's cheap to do properly, so both
 * call sites now go through this instead of a raw `!==`.
 *
 * crypto.timingSafeEqual throws if the two buffers aren't the same length rather than
 * returning false, so we check length first — for fixed-length HMAC digests (hex-
 * encoded, so a known, constant length) this never leaks anything a real attacker
 * could use, since length isn't secret and doesn't depend on secret content.
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

import crypto from 'crypto';

/**
 * Constant-time password comparison to prevent timing attacks.
 */
export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Derives a deterministic session token from ADMIN_SECRET.
 * The same token is re-derived on every request — no session store needed.
 */
export function createSessionToken(): string {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SECRET!)
    .update('admin-session')
    .digest('hex');
}

/**
 * Constant-time verification of the session cookie value.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

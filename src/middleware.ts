import { NextRequest, NextResponse } from 'next/server';

const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours — resets on every authenticated request

/**
 * Edge-compatible token verification using Web Crypto API.
 * Must produce the same result as createSessionToken() in admin-auth.ts.
 */
async function isValidSessionToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode('admin-session')
    );
    const expected = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison
    if (token.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < token.length; i++) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;

  if (token && (await isValidSessionToken(token))) {
    const res = NextResponse.next();
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all /api/admin/* routes except login and logout
  matcher: ['/api/admin/((?!login|logout).*)'],
};

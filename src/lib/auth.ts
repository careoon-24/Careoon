import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'careoon-production-super-secret-key-2026-secure-jwt'
);

export const AUTH_COOKIE_NAME = 'careoon_session';
export const ADMIN_COOKIE_NAME = 'careoon_admin_session';
export const NURSE_COOKIE_NAME = 'careoon_nurse_session';
export const PATIENT_COOKIE_NAME = 'careoon_patient_session';

export interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'NURSE' | 'ADMIN';
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(roleHint?: 'ADMIN' | 'NURSE' | 'PATIENT'): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  // 1. If explicit roleHint provided, prioritize that role's dedicated cookie
  if (roleHint === 'ADMIN') {
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (token) {
      const s = await verifySessionToken(token);
      if (s && s.role === 'ADMIN') return s;
    }
  } else if (roleHint === 'NURSE') {
    const token = cookieStore.get(NURSE_COOKIE_NAME)?.value;
    if (token) {
      const s = await verifySessionToken(token);
      if (s && (s.role === 'NURSE' || s.role === 'ADMIN')) return s;
    }
  } else if (roleHint === 'PATIENT') {
    const token = cookieStore.get(PATIENT_COOKIE_NAME)?.value;
    if (token) {
      const s = await verifySessionToken(token);
      if (s) return s;
    }
  }

  // 2. Auto-detect from referer header so 3 windows (Admin, Nurse, Patient) can run simultaneously
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    const referer = headerList.get('referer') || '';

    if (referer.includes('/admin')) {
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        const s = await verifySessionToken(token);
        if (s && s.role === 'ADMIN') return s;
      }
    } else if (referer.includes('/nurse')) {
      const token = cookieStore.get(NURSE_COOKIE_NAME)?.value;
      if (token) {
        const s = await verifySessionToken(token);
        if (s && (s.role === 'NURSE' || s.role === 'ADMIN')) return s;
      }
    } else if (referer.includes('/patient')) {
      const token = cookieStore.get(PATIENT_COOKIE_NAME)?.value;
      if (token) {
        const s = await verifySessionToken(token);
        if (s) return s;
      }
    }
  } catch {
    // headers() might not be supported in some edge contexts
  }

  // 3. Fallback checks: any valid session cookie
  const fallbackTokens = [
    cookieStore.get(ADMIN_COOKIE_NAME)?.value,
    cookieStore.get(NURSE_COOKIE_NAME)?.value,
    cookieStore.get(PATIENT_COOKIE_NAME)?.value,
    cookieStore.get(AUTH_COOKIE_NAME)?.value,
  ].filter(Boolean) as string[];

  for (const t of fallbackTokens) {
    const s = await verifySessionToken(t);
    if (s) return s;
  }

  return null;
}

export async function getCurrentUser(roleHint?: 'ADMIN' | 'NURSE' | 'PATIENT') {
  const session = await getSession(roleHint);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      nurseProfile: true,
    },
  });

  if (!user) return null;

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

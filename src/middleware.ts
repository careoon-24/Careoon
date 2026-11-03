import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'careoon-production-super-secret-key-2026-secure-jwt'
);

const AUTH_COOKIE_NAME = 'careoon_session';
const ADMIN_COOKIE_NAME = 'careoon_admin_session';
const NURSE_COOKIE_NAME = 'careoon_nurse_session';
const PATIENT_COOKIE_NAME = 'careoon_patient_session';

interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'NURSE' | 'ADMIN';
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow dedicated login / activation pages without authentication check
  const isExcludedLoginPath =
    pathname === '/admin/login' ||
    pathname === '/nurse/login' ||
    pathname === '/nurse/activate';

  if (isExcludedLoginPath) {
    return NextResponse.next();
  }

  // Protected route paths
  const isAdminPath = pathname.startsWith('/admin');
  const isNursePath = pathname.startsWith('/nurse');
  const isPatientPrivatePath =
    pathname.startsWith('/patient/bookings') ||
    pathname.startsWith('/patient/profile') ||
    pathname.startsWith('/patient/book');

  // Allow all public static files, landing page, public services browsing
  if (!isAdminPath && !isNursePath && !isPatientPrivatePath) {
    return NextResponse.next();
  }

  // 1. RBAC for ADMIN Portal: Check dedicated admin session cookie first
  if (isAdminPath) {
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value || req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyToken(adminToken);
    if (!session || session.role !== 'ADMIN') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. RBAC for NURSE Portal: Check dedicated nurse session cookie first
  if (isNursePath) {
    const nurseToken = req.cookies.get(NURSE_COOKIE_NAME)?.value || req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!nurseToken) {
      const loginUrl = new URL('/nurse/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyToken(nurseToken);
    if (!session || (session.role !== 'NURSE' && session.role !== 'ADMIN')) {
      const loginUrl = new URL('/nurse/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. RBAC for PATIENT Private Portal: Check dedicated patient session cookie
  if (isPatientPrivatePath) {
    const patientToken = req.cookies.get(PATIENT_COOKIE_NAME)?.value || req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!patientToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyToken(patientToken);
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/nurse/:path*',
    '/patient/bookings/:path*',
    '/patient/profile/:path*',
    '/patient/book/:path*',
  ],
};

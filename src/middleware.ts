import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'careoon-production-super-secret-key-2026-secure-jwt'
);

const AUTH_COOKIE_NAME = 'careoon_session';

interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'PATIENT' | 'NURSE' | 'ADMIN';
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

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Dedicated redirects per portal role
  if (!token) {
    let targetLogin = '/login';
    if (isAdminPath) targetLogin = '/admin/login';
    else if (isNursePath) targetLogin = '/nurse/login';

    const loginUrl = new URL(targetLogin, req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionPayload;

    // RBAC: Admin Portal strictly requires ADMIN role
    if (isAdminPath && session.role !== 'ADMIN') {
      const deniedUrl = new URL('/unauthorized', req.url);
      deniedUrl.searchParams.set('reason', 'admin_only');
      return NextResponse.redirect(deniedUrl);
    }

    // RBAC: Nurse Portal requires NURSE or ADMIN role
    if (isNursePath && session.role !== 'NURSE' && session.role !== 'ADMIN') {
      const deniedUrl = new URL('/unauthorized', req.url);
      deniedUrl.searchParams.set('reason', 'nurse_only');
      return NextResponse.redirect(deniedUrl);
    }

    // Request is authenticated and authorized
    return NextResponse.next();
  } catch (err) {
    // Invalid/expired token
    console.error('Middleware JWT error:', err);
    let targetLogin = '/login';
    if (isAdminPath) targetLogin = '/admin/login';
    else if (isNursePath) targetLogin = '/nurse/login';

    const loginUrl = new URL(targetLogin, req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
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

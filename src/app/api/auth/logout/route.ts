import { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  NURSE_COOKIE_NAME,
  PATIENT_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roleParam = searchParams.get('role');
  const referer = req.headers.get('referer') || '';

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  const clearCookie = (name: string) => {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  };

  if (roleParam === 'ADMIN' || referer.includes('/admin')) {
    clearCookie(ADMIN_COOKIE_NAME);
  } else if (roleParam === 'NURSE' || referer.includes('/nurse')) {
    clearCookie(NURSE_COOKIE_NAME);
  } else if (roleParam === 'PATIENT' || referer.includes('/patient')) {
    clearCookie(PATIENT_COOKIE_NAME);
  } else {
    // Clear all if general logout
    clearCookie(AUTH_COOKIE_NAME);
    clearCookie(ADMIN_COOKIE_NAME);
    clearCookie(NURSE_COOKIE_NAME);
    clearCookie(PATIENT_COOKIE_NAME);
  }

  return response;
}

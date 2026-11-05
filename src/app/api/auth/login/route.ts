import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import {
  createSessionToken,
  AUTH_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  NURSE_COOKIE_NAME,
  PATIENT_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/Phone and password are required' },
        { status: 400 }
      );
    }

    const identifier = (email || '').trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
          { nurseProfile: { nurseCode: identifier.toUpperCase() } },
        ],
      },
      include: {
        nurseProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'वापरकर्ता किंवा Nurse ID सापडला नाही / Invalid Email, Phone or Nurse ID' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'चुकीचा पासवर्ड / Incorrect password' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        nurseProfile: user.nurseProfile,
      },
      redirectUrl:
        user.role === 'ADMIN'
          ? '/admin'
          : user.role === 'NURSE'
          ? '/nurse'
          : '/patient',
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // 1. Set general active session
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...cookieOptions,
    });

    // 2. Set dedicated role-specific session so multiple windows can stay logged in simultaneously!
    if (user.role === 'ADMIN') {
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        ...cookieOptions,
      });
    } else if (user.role === 'NURSE') {
      response.cookies.set({
        name: NURSE_COOKIE_NAME,
        value: token,
        ...cookieOptions,
      });
    } else if (user.role === 'PATIENT') {
      response.cookies.set({
        name: PATIENT_COOKIE_NAME,
        value: token,
        ...cookieOptions,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    const message =
      error?.message?.includes('connect') || error?.message?.includes('timeout')
        ? 'डेटाबेस सर्व्हर सुरू होत आहे, कृपया ५ सेकंदांत पुन्हा प्रयत्न करा (Database is waking up, please retry in a moment)'
        : error?.message || 'लॉगिन करताना त्रुटी आली, कृपया पुन्हा प्रयत्न करा';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

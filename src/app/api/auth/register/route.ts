import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, fullName, password, role } = await req.json();

    if (!email || !phone || !fullName || !password) {
      return NextResponse.json(
        { error: 'All fields (name, email, phone, password) are required' },
        { status: 400 }
      );
    }

    const assignedRole = role === 'NURSE' ? 'NURSE' : 'PATIENT';

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or phone already exists' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        fullName: fullName.trim(),
        role: assignedRole,
        passwordHash,
        ...(assignedRole === 'NURSE'
          ? {
              nurseProfile: {
                create: {
                  registrationNumber: 'PENDING-' + Math.floor(100000 + Math.random() * 900000),
                  qualifications: JSON.stringify(['Nursing Degree']),
                  experienceYears: 1,
                  policeVerificationStatus: 'PENDING',
                  adminApprovalStatus: 'PENDING',
                  isAvailableNow: false,
                },
              },
            }
          : {}),
      },
      include: {
        nurseProfile: true,
      },
    });

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
        nurseProfile: user.nurseProfile,
      },
      redirectUrl: assignedRole === 'NURSE' ? '/nurse' : '/patient',
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import {
  createSessionToken,
  AUTH_COOKIE_NAME,
  PATIENT_COOKIE_NAME,
  NURSE_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, fullName, password, role } = await req.json();

    if (!email || !phone || !fullName || !password) {
      return NextResponse.json(
        { error: 'सर्व फील्ड्स (नाव, ईमेल, मोबाईल, पासवर्ड) आवश्यक आहेत' },
        { status: 400 }
      );
    }

    // Strict 10-digit Indian Mobile Validation
    const cleanPhone = String(phone).replace(/\D/g, '').trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'कृपया वैध १० अंकी मोबाईल नंबर टाका (उदा. 98220XXXXX)' },
        { status: 400 }
      );
    }

    // Clean Email validation
    const cleanEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'कृपया वैध ईमेल ॲड्रेस टाका (उदा. name@example.com)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे' },
        { status: 400 }
      );
    }

    const assignedRole = role === 'NURSE' ? 'NURSE' : 'PATIENT';

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { phone: cleanPhone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'या मोबाईल नंबर किंवा ईमेलवर आधीच खाते नोंदणीकृत आहे' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    };

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      ...cookieOptions,
    });

    if (assignedRole === 'NURSE') {
      response.cookies.set({
        name: NURSE_COOKIE_NAME,
        value: token,
        ...cookieOptions,
      });
    } else {
      response.cookies.set({
        name: PATIENT_COOKIE_NAME,
        value: token,
        ...cookieOptions,
      });
    }

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

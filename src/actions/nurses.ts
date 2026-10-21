'use server';

import prisma from '@/lib/prisma';
import { getSession, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import * as bcrypt from 'bcryptjs';

// Helper to generate a collision-free Sangli Nurse Code
async function generateUniqueNurseCode(): Promise<string> {
  let isUnique = false;
  let code = '';
  while (!isUnique) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    code = `SANGLI-RN-${randomSuffix}`;
    const existing = await prisma.nurseProfile.findUnique({
      where: { nurseCode: code },
    });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
}

export async function verifyNurseAction(nurseProfileId: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can verify nurses.');
  }

  // Check if nurse already has a code
  const existing = await prisma.nurseProfile.findUnique({
    where: { id: nurseProfileId },
  });

  if (!existing) {
    throw new Error('Nurse profile not found.');
  }

  let nurseCode = existing.nurseCode;
  if (!nurseCode) {
    nurseCode = await generateUniqueNurseCode();
  }

  const nurse = await prisma.nurseProfile.update({
    where: { id: nurseProfileId },
    data: {
      adminApprovalStatus: 'VERIFIED',
      policeVerificationStatus: 'VERIFIED',
      nurseCode,
    },
    include: {
      user: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'NURSE_PROFILE',
      entityId: nurseProfileId,
      action: 'NURSE_VERIFIED',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({
        nurseName: nurse.user.fullName,
        nurseCode,
        approval: 'VERIFIED',
      }),
    },
  });

  revalidatePath('/admin/nurses');
  revalidatePath('/patient');
  return { success: true, nurseCode };
}

export async function adminAddNurseAction(data: {
  fullName: string;
  phone: string;
  email: string;
  registrationNumber: string;
  qualifications: string;
  experienceYears: number;
  password?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can onboard verified nurses.');
  }

  const cleanPhone = data.phone.trim();
  const cleanEmail = data.email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: cleanEmail }, { phone: cleanPhone }],
    },
  });

  if (existingUser) {
    throw new Error('A user with this mobile number or email already exists.');
  }

  const nurseCode = await generateUniqueNurseCode();
  const rawPassword = data.password && data.password.trim().length >= 6 ? data.password.trim() : 'Nurse@123';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Create User + NurseProfile
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: 'NURSE',
      passwordHash,
      addressCity: 'Sangli',
      addressPincode: '416416',
      nurseProfile: {
        create: {
          nurseCode,
          registrationNumber: data.registrationNumber.trim().toUpperCase(),
          qualifications: data.qualifications.trim(),
          experienceYears: Number(data.experienceYears) || 1,
          adminApprovalStatus: 'VERIFIED',
          policeVerificationStatus: 'VERIFIED',
          isAvailableNow: true,
          serviceRadiusKm: 15.0,
          latitude: 16.8524,
          longitude: 74.5815,
        },
      },
    },
    include: {
      nurseProfile: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'NURSE_PROFILE',
      entityId: user.nurseProfile?.id || user.id,
      action: 'NURSE_CREATED_BY_ADMIN',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({
        fullName: user.fullName,
        nurseCode,
        phone: cleanPhone,
      }),
    },
  });

  revalidatePath('/admin/nurses');
  revalidatePath('/patient');
  return {
    success: true,
    nurseCode,
    tempPassword: rawPassword,
    nurseName: user.fullName,
  };
}

export async function nurseAccessLoginAction(nurseCode: string) {
  const cleanCode = nurseCode.trim().toUpperCase();

  const profile = await prisma.nurseProfile.findUnique({
    where: { nurseCode: cleanCode },
    include: { user: true },
  });

  if (!profile || profile.adminApprovalStatus !== 'VERIFIED') {
    return {
      success: false,
      error: 'वैध किंवा मंजूर Nurse ID आढळला नाही / Invalid or unverified Nurse ID.',
    };
  }

  const token = await createSessionToken({
    userId: profile.user.id,
    email: profile.user.email,
    fullName: profile.user.fullName,
    role: 'NURSE',
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, redirectUrl: '/nurse' };
}

export async function toggleNurseAvailabilityAction(isAvailable: boolean) {
  const session = await getSession();
  if (!session || session.role !== 'NURSE') {
    throw new Error('Unauthorized');
  }

  const nurse = await prisma.nurseProfile.update({
    where: { userId: session.userId },
    data: {
      isAvailableNow: isAvailable,
    },
  });

  revalidatePath('/nurse');
  revalidatePath('/nurse/availability');
  return { success: true, isAvailableNow: nurse.isAvailableNow };
}

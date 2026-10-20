'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function verifyNurseAction(nurseProfileId: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can verify nurses.');
  }

  const nurse = await prisma.nurseProfile.update({
    where: { id: nurseProfileId },
    data: {
      adminApprovalStatus: 'VERIFIED',
      policeVerificationStatus: 'VERIFIED',
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
        approval: 'VERIFIED',
      }),
    },
  });

  revalidatePath('/admin/nurses');
  revalidatePath('/patient');
  return { success: true };
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

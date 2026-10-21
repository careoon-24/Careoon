'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPatientProfileAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      fullName: true,
      role: true,
      age: true,
      gender: true,
      bloodGroup: true,
      addressStreet: true,
      addressApartment: true,
      addressCity: true,
      addressPincode: true,
      emergencyContactName: true,
      emergencyContactPhone: true,
      chronicConditions: true,
      allergies: true,
      savedFamilyMembers: true,
    },
  });

  return { success: true, user };
}

export async function updatePatientProfileAction(data: {
  fullName?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  addressStreet?: string;
  addressApartment?: string;
  addressCity?: string;
  addressPincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  chronicConditions?: string;
  allergies?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      ...data,
      addressCity: data.addressCity || 'Sangli',
      addressPincode: data.addressPincode || '416416',
    },
  });

  revalidatePath('/patient/profile');
  revalidatePath('/patient/book');
  return { success: true, user: updated };
}

export async function saveFamilyMemberAction(member: {
  name: string;
  relationship: string; // e.g. Mother, Father, Spouse, Child, Grandparent
  age: number;
  gender: string;
  phone?: string;
  addressStreet?: string;
  addressApartment?: string;
  addressCity?: string;
  addressPincode?: string;
}) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { savedFamilyMembers: true },
  });

  let currentMembers = [];
  try {
    currentMembers = user?.savedFamilyMembers ? JSON.parse(user.savedFamilyMembers) : [];
  } catch {
    currentMembers = [];
  }

  const newMember = {
    id: `fam_${Date.now()}`,
    ...member,
    addressCity: member.addressCity || 'Sangli',
    addressPincode: member.addressPincode || '416416',
  };

  currentMembers.push(newMember);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      savedFamilyMembers: JSON.stringify(currentMembers),
    },
  });

  revalidatePath('/patient/profile');
  return { success: true, member: newMember, familyMembers: currentMembers };
}

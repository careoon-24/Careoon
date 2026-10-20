'use server';

import prisma from '@/lib/prisma';

export async function getActiveCategoriesAndServices() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
      },
    },
  });

  return categories;
}

export async function getServiceBySlug(slug: string) {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  return service;
}

export async function getApprovedNurses(serviceId?: string) {
  const nurses = await prisma.nurseProfile.findMany({
    where: {
      adminApprovalStatus: 'VERIFIED',
      policeVerificationStatus: 'VERIFIED',
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          phone: true,
          email: true,
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return nurses.map((n) => ({
    ...n,
    qualifications: JSON.parse(n.qualifications || '[]') as string[],
  }));
}

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

export async function adminCreateCategoryAction(data: {
  name: string;
  description?: string;
  displayOrder?: number;
}) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description: data.description || null,
      displayOrder: data.displayOrder || 0,
      isActive: true,
    },
  });

  return { success: true, category };
}

export async function adminCreateServiceAction(data: {
  name: string;
  categoryId: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  durationMinutes: number;
  commissionPercent: number;
  eligibilityRules?: string[];
}) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const service = await prisma.service.create({
    data: {
      name: data.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      categoryId: data.categoryId,
      description: data.description,
      shortDescription: data.shortDescription || data.description.slice(0, 120),
      basePrice: data.basePrice,
      durationMinutes: data.durationMinutes,
      commissionPercent: data.commissionPercent,
      eligibilityRules: JSON.stringify(data.eligibilityRules || []),
      isActive: true,
    },
  });

  return { success: true, service };
}

export async function adminUpdateServiceAction(
  serviceId: string,
  data: {
    name?: string;
    categoryId?: string;
    description?: string;
    basePrice?: number;
    durationMinutes?: number;
    commissionPercent?: number;
    isActive?: boolean;
  }
) {
  const service = await prisma.service.update({
    where: { id: serviceId },
    data,
  });

  return { success: true, service };
}

export async function adminDeleteServiceAction(serviceId: string) {
  await prisma.service.delete({
    where: { id: serviceId },
  });

  return { success: true };
}

export async function adminToggleServiceAction(serviceId: string, isActive: boolean) {
  const service = await prisma.service.update({
    where: { id: serviceId },
    data: { isActive },
  });

  return { success: true, service };
}

'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function validateCouponAction(code: string, cartTotal: number) {
  if (!code || !code.trim()) {
    return { valid: false, message: 'कृपया वैध कूपन कोड टाका / Please enter a coupon code.' };
  }

  const cleanCode = code.trim().toUpperCase();

  const coupon = await prisma.coupon.findUnique({
    where: { code: cleanCode },
  });

  if (!coupon) {
    return { valid: false, message: `कूपन "${cleanCode}" आढळला नाही / Coupon "${cleanCode}" not found.` };
  }

  if (!coupon.isActive) {
    return { valid: false, message: `कूपन "${cleanCode}" सध्या निष्क्रीय आहे / Coupon "${cleanCode}" is inactive.` };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, message: `कूपन "${cleanCode}" ची मुदत संपली आहे / Coupon has expired.` };
  }

  if (cartTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `किमान ₹${coupon.minOrderAmount} च्या ऑर्डरवर लागू / Minimum order of ₹${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENT') {
    discountAmount = Math.round((cartTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    // FIXED amount
    discountAmount = Math.min(coupon.discountValue, cartTotal);
  }

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  return {
    valid: true,
    code: coupon.code,
    description: coupon.description || `₹${discountAmount} off applied`,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
    finalTotal,
    message: `🎉 कूपन "${coupon.code}" यशस्वीरित्या लागू झाले! ₹${discountAmount} सवलत मिळाली.`,
  };
}

export async function adminGetCouponsAction() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return { success: true, coupons };
}

export async function adminCreateCouponAction(data: {
  code: string;
  description?: string;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can create coupons.');
  }

  const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

  if (!cleanCode) {
    throw new Error('Coupon code is required.');
  }

  if (data.discountValue <= 0) {
    throw new Error('Discount value must be greater than 0.');
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: cleanCode,
      description: data.description || null,
      discountType: data.discountType || 'FIXED',
      discountValue: Number(data.discountValue),
      minOrderAmount: Number(data.minOrderAmount || 0),
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: true,
      usageCount: 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'COUPON',
      entityId: coupon.id,
      action: 'COUPON_CREATED',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({ code: cleanCode, discountValue: data.discountValue }),
    },
  });

  revalidatePath('/admin/coupons');
  revalidatePath('/admin/services');
  return { success: true, coupon };
}

export async function adminToggleCouponAction(couponId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive },
  });

  revalidatePath('/admin/coupons');
  return { success: true, coupon };
}

export async function adminDeleteCouponAction(couponId: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  revalidatePath('/admin/coupons');
  return { success: true };
}

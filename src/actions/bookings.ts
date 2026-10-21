'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createBookingAction(formData: {
  serviceId: string;
  nurseId?: string;
  scheduledDate: string;
  scheduledTime: string;
  addressLine: string;
  landmark?: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  patientNotes?: string;
  patientContactPhone: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  tipAmount?: number;
  couponCode?: string;
}) {
  const session = await getSession();
  if (!session) {
    throw new Error('You must be logged in to create a booking.');
  }

  const service = await prisma.service.findUnique({
    where: { id: formData.serviceId },
  });

  if (!service) {
    throw new Error('Selected service not found.');
  }

  // Financial calculations
  const basePrice = service.basePrice;
  const commissionPercent = service.commissionPercent;
  const commissionAmount = (basePrice * commissionPercent) / 100;
  const nurseEarnings = basePrice - commissionAmount;
  const tip = formData.tipAmount || 0;

  // Coupon Discount Calculation
  let discountAmount = 0;
  let appliedCouponCode: string | null = null;

  if (formData.couponCode && formData.couponCode.trim()) {
    const cleanCode = formData.couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date())) {
      if (basePrice >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENT') {
          discountAmount = Math.round((basePrice * coupon.discountValue) / 100);
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, basePrice);
        }
        appliedCouponCode = coupon.code;

        // Increment coupon usage
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }
  }

  const totalAmount = Math.max(0, basePrice - discountAmount + tip);

  const bookingCode = `CRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const booking = await prisma.booking.create({
    data: {
      bookingCode,
      patientId: session.userId,
      serviceId: service.id,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      durationMinutes: service.durationMinutes,
      addressLine: formData.addressLine,
      landmark: formData.landmark,
      city: formData.city || 'Sangli',
      postalCode: formData.postalCode || '416416',
      latitude: formData.latitude || 16.8524,
      longitude: formData.longitude || 74.5815,
      patientNotes: formData.patientNotes,
      patientContactPhone: formData.patientContactPhone,
      patientName: formData.patientName,
      patientAge: formData.patientAge,
      patientGender: formData.patientGender,
      servicePrice: basePrice,
      commissionPercent,
      commissionAmount,
      nurseEarningsAmount: nurseEarnings,
      tipAmount: tip,
      couponCode: appliedCouponCode,
      discountAmount,
      totalPatientAmount: totalAmount,
      status: formData.nurseId ? 'NURSE_OFFERED' : 'SEARCHING_NURSE',
      paymentStatus: 'UNPAID',
    },
  });

  // If a nurse was selected, create the 15-minute offer
  if (formData.nurseId) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes window
    await prisma.bookingOffer.create({
      data: {
        bookingId: booking.id,
        nurseId: formData.nurseId,
        status: 'PENDING',
        expiresAt,
      },
    });
  }

  // Record Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: 'BOOKING',
      entityId: booking.id,
      action: 'BOOKING_CREATED',
      actorId: session.userId,
      actorRole: session.role,
      newValues: JSON.stringify({ bookingCode, status: booking.status, totalAmount }),
    },
  });

  revalidatePath('/patient/bookings');
  revalidatePath('/admin/bookings');
  return { success: true, bookingId: booking.id, bookingCode };
}

export async function respondToOfferAction(offerId: string, accept: boolean, rejectionReason?: string) {
  const session = await getSession();
  if (!session || (session.role !== 'NURSE' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const offer = await prisma.bookingOffer.findUnique({
    where: { id: offerId },
    include: { booking: true },
  });

  if (!offer) {
    throw new Error('Offer not found.');
  }

  if (offer.status !== 'PENDING') {
    throw new Error(`Offer has already been ${offer.status.toLowerCase()}.`);
  }

  if (new Date() > new Date(offer.expiresAt)) {
    await prisma.bookingOffer.update({
      where: { id: offerId },
      data: { status: 'EXPIRED' },
    });
    throw new Error('This offer has expired (15-minute response window closed).');
  }

  if (accept) {
    // 1. Accept offer
    await prisma.bookingOffer.update({
      where: { id: offerId },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // 2. Lock booking with this nurse and set CONFIRMED
    await prisma.booking.update({
      where: { id: offer.bookingId },
      data: {
        nurseId: offer.nurseId,
        status: 'CONFIRMED',
      },
    });

    // 3. Create nurse payable record
    await prisma.payable.create({
      data: {
        nurseId: offer.nurseId,
        bookingId: offer.bookingId,
        amount: offer.booking.nurseEarningsAmount + offer.booking.tipAmount,
        status: 'UNPAID',
      },
    });

    // 4. Audit Log
    await prisma.auditLog.create({
      data: {
        entityType: 'BOOKING',
        entityId: offer.bookingId,
        action: 'OFFER_ACCEPTED',
        actorId: session.userId,
        actorRole: session.role,
        newValues: JSON.stringify({ nurseId: offer.nurseId, status: 'CONFIRMED' }),
      },
    });
  } else {
    // Reject offer and return booking to SEARCHING_NURSE for immediate reselection
    await prisma.bookingOffer.update({
      where: { id: offerId },
      data: {
        status: 'REJECTED',
        respondedAt: new Date(),
        rejectionReason: rejectionReason || 'Nurse unavailable',
      },
    });

    await prisma.booking.update({
      where: { id: offer.bookingId },
      data: {
        nurseId: null,
        status: 'SEARCHING_NURSE',
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'BOOKING',
        entityId: offer.bookingId,
        action: 'OFFER_REJECTED',
        actorId: session.userId,
        actorRole: session.role,
        newValues: JSON.stringify({ reason: rejectionReason }),
      },
    });
  }

  revalidatePath('/nurse');
  revalidatePath(`/nurse/jobs/${offer.bookingId}`);
  revalidatePath(`/patient/bookings/${offer.bookingId}`);
  revalidatePath('/admin/bookings');

  return { success: true };
}

export async function updateClinicalProgressAction(
  bookingId: string,
  stage: 'ARRIVED' | 'STARTED' | 'COMPLETED',
  notes?: string
) {
  const session = await getSession();
  if (!session || (session.role !== 'NURSE' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const now = new Date();
  let updateData: any = {};

  if (stage === 'ARRIVED') {
    updateData = {
      status: 'NURSE_ARRIVED',
      arrivedAt: now,
      arrivalNotes: notes,
    };
  } else if (stage === 'STARTED') {
    updateData = {
      status: 'IN_PROGRESS',
      startedAt: now,
    };
  } else if (stage === 'COMPLETED') {
    updateData = {
      status: 'COMPLETED',
      completedAt: now,
      clinicalNotes: notes,
    };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'BOOKING',
      entityId: bookingId,
      action: `CLINICAL_${stage}`,
      actorId: session.userId,
      actorRole: session.role,
      newValues: JSON.stringify(updateData),
    },
  });

  revalidatePath(`/nurse/jobs/${bookingId}`);
  revalidatePath(`/patient/bookings/${bookingId}`);
  revalidatePath('/admin/bookings');

  return { success: true };
}

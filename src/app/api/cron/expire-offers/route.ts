import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // 1. Find all pending offers that have exceeded the 15-minute deadline
    const expiredOffers = await prisma.bookingOffer.findMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now },
      },
      include: {
        booking: true,
      },
    });

    if (expiredOffers.length === 0) {
      return NextResponse.json({ message: 'No offers expired', processed: 0 });
    }

    // 2. Mark offers as EXPIRED
    await prisma.bookingOffer.updateMany({
      where: {
        id: { in: expiredOffers.map((o) => o.id) },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // 3. Reset affected bookings back to SEARCHING_NURSE so patients can immediately select another nurse
    const bookingIds = expiredOffers.map((o) => o.bookingId);
    await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
        status: 'NURSE_OFFERED',
      },
      data: {
        status: 'SEARCHING_NURSE',
        nurseId: null,
      },
    });

    // 4. Create system audit logs
    for (const offer of expiredOffers) {
      await prisma.auditLog.create({
        data: {
          entityType: 'BOOKING_OFFER',
          entityId: offer.id,
          action: 'OFFER_WINDOW_EXPIRED',
          actorId: offer.booking.patientId,
          actorRole: 'PATIENT',
          newValues: JSON.stringify({
            bookingId: offer.bookingId,
            nurseId: offer.nurseId,
            reason: '15-minute nurse response window elapsed without response',
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      expiredCount: expiredOffers.length,
      affectedBookings: bookingIds.length,
    });
  } catch (error: any) {
    console.error('Expiry cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

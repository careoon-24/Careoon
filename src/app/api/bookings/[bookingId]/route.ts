import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        patient: {
          select: { id: true, fullName: true, phone: true, email: true, avatarUrl: true },
        },
        assignedNurse: {
          include: {
            user: { select: { fullName: true, phone: true, avatarUrl: true } },
          },
        },
        offers: {
          orderBy: { sentAt: 'desc' },
          take: 5,
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        reviews: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Role check: Only the booking's patient, assigned nurse, or admin can inspect this booking
    if (session.role === 'PATIENT' && booking.patientId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.role === 'NURSE') {
      const nurseProfile = await prisma.nurseProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!nurseProfile) {
        return NextResponse.json({ error: 'Nurse profile not found' }, { status: 403 });
      }

      const isAssigned = booking.nurseId === nurseProfile.id;
      const hasOffer = booking.offers?.some((o) => o.nurseId === nurseProfile.id);

      if (!isAssigned && !hasOffer) {
        return NextResponse.json(
          { error: 'Forbidden: You do not have access to this patient visit record.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Fetch booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

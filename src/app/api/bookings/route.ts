import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereClause: any = {};
    if (session.role === 'PATIENT') {
      whereClause.patientId = session.userId;
    } else if (session.role === 'NURSE') {
      const nurseProfile = await prisma.nurseProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!nurseProfile) {
        return NextResponse.json({ success: true, bookings: [] });
      }
      whereClause.nurseId = nurseProfile.id;
    }
    // ADMIN sees all bookings (empty whereClause)

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        patient: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        assignedNurse: {
          include: {
            user: { select: { fullName: true, phone: true, avatarUrl: true } },
          },
        },
        offers: true,
        payments: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

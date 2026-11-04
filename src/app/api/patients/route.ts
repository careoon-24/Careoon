import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession('ADMIN');
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const patients = await prisma.user.findMany({
      where: {
        role: 'PATIENT',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        avatarUrl: true,
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
        createdAt: true,
        updatedAt: true,
        patientBookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            servicePrice: true,
            totalPatientAmount: true,
            scheduledDate: true,
            scheduledTime: true,
            paymentStatus: true,
            createdAt: true,
            service: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const metrics = {
      totalPatients: patients.length,
      patientsWithBookings: patients.filter((p) => p.patientBookings.length > 0).length,
      sangliCityCount: patients.filter((p) => (p.addressCity || '').toLowerCase().includes('sangli')).length,
      chronicPatientsCount: patients.filter((p) => Boolean(p.chronicConditions && p.chronicConditions.trim())).length,
    };

    return NextResponse.json({ success: true, metrics, patients });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}


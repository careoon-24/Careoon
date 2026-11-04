import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createPhonePePaymentOrder, getPhonePeConfig } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession('PATIENT');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to pay.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        patient: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Role check: Only the booking's patient or admin can initiate payment
    if (booking.patientId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. You do not own this booking.' }, { status: 403 });
    }

    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        message: 'This booking has already been paid and confirmed.',
        redirectUrl: `/patient/bookings/${booking.id}`,
      });
    }

    const amountInRupees = booking.totalPatientAmount || booking.servicePrice;
    
    // Resolve origin
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Create payment order with PhonePe
    const orderRes = await createPhonePePaymentOrder({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      amountInRupees,
      patientUserId: session.userId,
      patientPhone: booking.patientContactPhone,
      appBaseUrl,
    });

    // Record or update pending Payment record in database
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: amountInRupees,
        currency: 'INR',
        method: 'PHONEPE_UPI',
        status: 'PENDING_VERIFICATION',
        paymentRef: orderRes.transactionId,
      },
    });

    if (orderRes.success && orderRes.redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl: orderRes.redirectUrl,
        transactionId: orderRes.transactionId,
      });
    }

    // If PhonePe Sandbox returns preprod/offline notice, provide safe interactive test simulator link
    const config = getPhonePeConfig();
    const testSimulatorUrl = `/api/payments/phonepe/simulate?bookingId=${booking.id}&txnId=${orderRes.transactionId}&amount=${amountInRupees}&code=${booking.bookingCode}`;

    return NextResponse.json({
      success: true,
      redirectUrl: testSimulatorUrl,
      transactionId: orderRes.transactionId,
      isSimulator: true,
      notice: config.env === 'UAT' ? 'Using PhonePe Sandbox UAT Simulator' : undefined,
    });
  } catch (err: any) {
    console.error('Payment Initiation Error:', err);
    return NextResponse.json({ error: err.message || 'Payment initiation failed.' }, { status: 500 });
  }
}

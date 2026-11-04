import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPhonePeConfig, verifyCallbackChecksum, checkPhonePeTransactionStatus } from '@/lib/phonepe';

export const dynamic = 'force-dynamic';

async function handlePaymentConfirmation(bookingId: string, txnId: string, isSuccessful: boolean, responseDetails?: any) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      assignedNurse: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found during payment callback');
  }

  if (isSuccessful) {
    // 1. Mark Booking as PAID and activate Nurse Offer
    const newStatus = booking.nurseId ? 'NURSE_OFFERED' : 'SEARCHING_NURSE';

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: newStatus,
      },
    });

    // 2. If a nurse was assigned, dispatch the 15-minute offer now that payment is confirmed
    if (booking.nurseId) {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await prisma.bookingOffer.create({
        data: {
          bookingId: booking.id,
          nurseId: booking.nurseId,
          status: 'PENDING',
          expiresAt,
        },
      });
    }

    // 3. Update Payment record in database
    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId: booking.id, paymentRef: txnId },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'PAID',
          reconciledAt: new Date(),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPatientAmount || booking.servicePrice,
          currency: 'INR',
          method: 'PHONEPE_UPI',
          status: 'PAID',
          paymentRef: txnId,
          reconciledAt: new Date(),
        },
      });
    }

    // 4. Automatically create Payable for Nurse Earnings (Zero Mismatch)
    if (booking.nurseId && booking.nurseEarningsAmount > 0) {
      const existingPayable = await prisma.payable.findFirst({
        where: { bookingId: booking.id, nurseId: booking.nurseId },
      });

      if (!existingPayable) {
        await prisma.payable.create({
          data: {
            nurseId: booking.nurseId,
            bookingId: booking.id,
            amount: booking.nurseEarningsAmount,
            status: 'UNPAID', // Eligible for weekly batch settlement
          },
        });
      }
    }

    // 5. Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        entityType: 'PAYMENT',
        entityId: txnId,
        action: 'PAYMENT_VERIFIED_PHONEPE',
        actorId: booking.patientId,
        actorRole: 'PATIENT',
        newValues: JSON.stringify({
          bookingCode: booking.bookingCode,
          amount: booking.totalPatientAmount,
          method: 'PHONEPE_UPI',
          nurseEarnings: booking.nurseEarningsAmount,
          commission: booking.commissionAmount,
          responseDetails,
        }),
      },
    });

    return true;
  } else {
    // Payment failed
    await prisma.payment.updateMany({
      where: { bookingId: booking.id, paymentRef: txnId },
      data: {
        status: 'FAILED',
        failureReason: responseDetails?.message || 'Payment cancelled or declined by user/bank',
      },
    });

    return false;
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get('bookingId');
  const txnIdParam = url.searchParams.get('txnId');

  const config = getPhonePeConfig();

  try {
    let base64Response = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      base64Response = (formData.get('response') as string) || '';
    } else {
      const json = await req.json().catch(() => ({}));
      base64Response = json.response || '';
    }

    const xVerify = req.headers.get('x-verify') || '';

    let isSuccess = false;
    let resolvedTxnId = txnIdParam || '';
    let parsedData: any = null;

    if (base64Response) {
      // In PROD, strictly verify checksum
      if (config.env === 'PROD') {
        const isValid = verifyCallbackChecksum(base64Response, xVerify, config.saltKey, config.saltIndex);
        if (!isValid) {
          console.error('Invalid PhonePe Webhook Checksum signature.');
          return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
        }
      }

      try {
        const decoded = JSON.parse(Buffer.from(base64Response, 'base64').toString('utf-8'));
        parsedData = decoded;
        isSuccess = decoded.code === 'PAYMENT_SUCCESS';
        resolvedTxnId = decoded.data?.merchantTransactionId || resolvedTxnId;
      } catch (err) {
        console.error('Failed to parse PhonePe base64 payload:', err);
      }
    } else {
      // Query status directly from PhonePe API if no payload
      if (resolvedTxnId) {
        const statusRes = await checkPhonePeTransactionStatus(resolvedTxnId);
        isSuccess = statusRes.success && statusRes.status === 'PAYMENT_SUCCESS';
        parsedData = statusRes.data;
      }
    }

    if (bookingId && resolvedTxnId) {
      await handlePaymentConfirmation(bookingId, resolvedTxnId, isSuccess, parsedData);
    }

    // Redirect user to booking details
    const redirectUrl = new URL(`/patient/bookings/${bookingId}`, req.url);
    redirectUrl.searchParams.set('payment', isSuccess ? 'success' : 'failed');
    redirectUrl.searchParams.set('txn', resolvedTxnId);

    return NextResponse.redirect(redirectUrl, 303);
  } catch (err: any) {
    console.error('PhonePe Callback Error:', err);
    const fallbackRedirect = new URL(`/patient/bookings/${bookingId || ''}`, req.url);
    fallbackRedirect.searchParams.set('payment', 'error');
    return NextResponse.redirect(fallbackRedirect, 303);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get('bookingId');
  const txnId = url.searchParams.get('txnId') || `TXN_${Date.now()}`;
  const status = url.searchParams.get('status') || 'SUCCESS';

  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
  }

  const isSuccess = status === 'SUCCESS';
  try {
    await handlePaymentConfirmation(bookingId, txnId, isSuccess, { status, source: 'SIMULATOR' });
  } catch (err) {
    console.error('Error handling GET callback:', err);
  }

  const redirectUrl = new URL(`/patient/bookings/${bookingId}`, req.url);
  redirectUrl.searchParams.set('payment', isSuccess ? 'success' : 'failed');
  redirectUrl.searchParams.set('txn', txnId);
  return NextResponse.redirect(redirectUrl);
}

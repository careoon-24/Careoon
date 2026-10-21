'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function reconcilePaymentAction(formData: {
  bookingId: string;
  amount: number;
  method: string;
  paymentRef: string;
}) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can reconcile payments.');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: formData.bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found.');
  }

  // 1. Create or update payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: formData.amount,
      method: formData.method,
      status: 'PAID',
      paymentRef: formData.paymentRef,
      reconciledByAdminId: session.userId,
      reconciledAt: new Date(),
    },
  });

  // 2. Mark booking payment status as PAID
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
    },
  });

  // 3. Log audit event
  await prisma.auditLog.create({
    data: {
      entityType: 'PAYMENT',
      entityId: payment.id,
      action: 'PAYMENT_RECONCILED',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({
        bookingId: booking.id,
        amount: formData.amount,
        paymentRef: formData.paymentRef,
      }),
    },
  });

  revalidatePath('/admin/finance');
  revalidatePath('/admin/bookings');
  revalidatePath(`/patient/bookings/${booking.id}`);

  return { success: true };
}

export async function generatePayoutBatchAction() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only administrators can generate payout batches.');
  }

  // Find all unpaid payables
  const unpaidPayables = await prisma.payable.findMany({
    where: { status: 'UNPAID' },
  });

  if (unpaidPayables.length === 0) {
    throw new Error('No unpaid earnings to batch.');
  }

  const totalAmount = unpaidPayables.reduce((sum, p) => sum + p.amount, 0);
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const batchCode = `BATCH-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const batch = await prisma.payoutBatch.create({
    data: {
      batchCode,
      periodStart: oneWeekAgo,
      periodEnd: now,
      totalAmount,
      status: 'OPEN',
      processedByAdminId: session.userId,
    },
  });

  // Assign batchId to all these payables
  await prisma.payable.updateMany({
    where: {
      id: { in: unpaidPayables.map((p) => p.id) },
    },
    data: {
      payoutBatchId: batch.id,
      status: 'BATCHED',
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      entityType: 'PAYOUT_BATCH',
      entityId: batch.id,
      action: 'PAYOUT_BATCH_GENERATED',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({ batchCode, totalAmount, payablesCount: unpaidPayables.length }),
    },
  });

  revalidatePath('/admin/finance');
  return { success: true, batchId: batch.id, batchCode };
}

export async function markBatchPaidAction(batchId: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await prisma.payoutBatch.update({
    where: { id: batchId },
    data: {
      status: 'PAID',
      processedAt: new Date(),
    },
  });

  await prisma.payable.updateMany({
    where: { payoutBatchId: batchId },
    data: { status: 'PAID' },
  });

  await prisma.auditLog.create({
    data: {
      entityType: 'PAYOUT_BATCH',
      entityId: batchId,
      action: 'PAYOUT_BATCH_PAID',
      actorId: session.userId,
      actorRole: 'ADMIN',
      newValues: JSON.stringify({ status: 'PAID' }),
    },
  });

  revalidatePath('/admin/finance');
  return { success: true };
}

export async function nurseCollectPaymentAction(formData: {
  bookingId: string;
  method: 'UPI' | 'CASH';
  isDone: boolean;
  notes?: string;
  collectedAmount?: number;
}) {
  const session = await getSession();
  if (!session || (session.role !== 'NURSE' && session.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: formData.bookingId },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const now = new Date();
  const paymentStatus = formData.isDone ? 'PAID' : 'PENDING_VERIFICATION';
  const amount = formData.collectedAmount || booking.totalPatientAmount;

  // 1. Create Payment Record with full timestamp & nurse tracking
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount,
      method: formData.method,
      status: paymentStatus,
      isCashCollected: formData.method === 'CASH' && formData.isDone,
      collectedByNurseId: session.userId,
      collectedAt: now,
      nurseNotes: formData.notes,
      paymentRef: `${formData.method}-${now.getTime()}`,
    },
  });

  // 2. Update Booking Status
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: formData.isDone ? 'PAID' : 'PENDING_VERIFICATION',
    },
  });

  // 3. Immutable Audit Log tracking exact time and result
  await prisma.auditLog.create({
    data: {
      entityType: 'PAYMENT_COLLECTION',
      entityId: payment.id,
      action: formData.isDone ? 'NURSE_PAYMENT_COLLECTED_DONE' : 'NURSE_PAYMENT_ATTEMPT_NOT_DONE',
      actorId: session.userId,
      actorRole: session.role,
      newValues: JSON.stringify({
        bookingId: booking.id,
        method: formData.method,
        amount,
        isDone: formData.isDone,
        timestamp: now.toISOString(),
        notes: formData.notes,
      }),
    },
  });

  revalidatePath(`/nurse/jobs/${booking.id}`);
  revalidatePath(`/patient/bookings/${booking.id}`);
  revalidatePath('/admin/finance');
  return { success: true, paymentId: payment.id, status: paymentStatus };
}

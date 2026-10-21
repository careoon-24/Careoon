import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ success: true, auditLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

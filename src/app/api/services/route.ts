import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

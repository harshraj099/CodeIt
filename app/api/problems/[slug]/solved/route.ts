import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getOrCreateProblemBySlug } from '@/lib/problems-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = await requireAuth();
    const problemId = await getOrCreateProblemBySlug(slug);

    const solved = await prisma.solvedProblem.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
    });

    return NextResponse.json({ solved: !!solved });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ solved: false });
    }
    console.error('Error checking solved status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check solved status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = await requireAuth();
    const problemId = await getOrCreateProblemBySlug(slug);

    const solved = await prisma.solvedProblem.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });

    return NextResponse.json({ success: true, solved });
  } catch (error: any) {
    console.error('Error marking problem as solved:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark problem as solved' },
      { status: 500 }
    );
  }
}


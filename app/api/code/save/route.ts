import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { getOrCreateProblemBySlug } from '@/lib/problems-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { problemId, language, code } = await request.json();

    if (!problemId || !language || code === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, language, code' },
        { status: 400 }
      );
    }

    const actualProblemId = await getOrCreateProblemBySlug(problemId);
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Not logged in' }, { status: 401 }      );
    }

    const userCode = await prisma.userCode.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId: actualProblemId,
        },
      },
      update: {
        language,
        code,
        updatedAt: new Date(),
      },
      create: {
        userId,
        problemId: actualProblemId,
        language,
        code,
      },
    });

    return NextResponse.json({ success: true, userCode });
  } catch (error: any) {
    console.error('Error saving code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save code' },
      { status: 500 }
    );
  }
}


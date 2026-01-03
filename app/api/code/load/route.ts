import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/auth';
import { getOrCreateProblemBySlug } from '@/lib/problems-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json(
        { error: 'Missing problemId parameter' },
        { status: 400 }
      );
    }

    // problemId can be either a slug or actual ID
    const actualProblemId = await getOrCreateProblemBySlug(problemId);
    const userId = await getCurrentUserId();

    // If user is not logged in, return null
    if (!userId) {
      return NextResponse.json({ code: null, language: null });
    }

    const userCode = await prisma.userCode.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: actualProblemId,
        },
      },
    });

    if (userCode) {
      return NextResponse.json({
        code: userCode.code,
        language: userCode.language,
        updatedAt: userCode.updatedAt,
      });
    }

    // Return null if no saved code exists
    return NextResponse.json({ code: null, language: null });
  } catch (error: any) {
    console.error('Error loading code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load code' },
      { status: 500 }
    );
  }
}


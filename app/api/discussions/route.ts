import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getOrCreateProblemBySlug } from '@/lib/problems-db';

export const dynamic = 'force-dynamic';

// GET /api/discussions?problemId=123
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

    const actualProblemId = await getOrCreateProblemBySlug(problemId);
    const discussions = await prisma.discussion.findMany({
      where: { problemId: actualProblemId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get vote counts for each discussion
    const discussionsWithVotes = await Promise.all(
      discussions.map(async (discussion) => {
        const votes = await prisma.vote.findMany({
          where: {
            targetType: 'discussion',
            targetId: discussion.id,
          },
        });

        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        const voteCount = votes.reduce((sum, vote) => sum + vote.value, 0);

        return {
          ...discussion,
          voteCount,
          upvotes,
          downvotes,
          commentCount: discussion._count.comments,
        };
      })
    );

    // Sort by vote count (descending)
    discussionsWithVotes.sort((a, b) => b.voteCount - a.voteCount);

    return NextResponse.json(discussionsWithVotes);
  } catch (error: any) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

// POST /api/discussions
export async function POST(request: NextRequest) {
  try {
    const { problemId, title, content } = await request.json();

    if (!problemId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, title, content' },
        { status: 400 }
      );
    }

    const actualProblemId = await getOrCreateProblemBySlug(problemId);
    const userId = await requireAuth();

    const discussion = await prisma.discussion.create({
      data: {
        problemId: actualProblemId,
        userId,
        title,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      ...discussion,
      voteCount: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to create discussions' },
        { status: 401 }
      );
    }
    console.error('Error creating discussion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create discussion' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { targetType, targetId, value } = await request.json();

    if (!targetType || !targetId || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: targetType, targetId, value' },
        { status: 400 }
      );
    }

    if (targetType !== 'discussion' && targetType !== 'comment') {
      return NextResponse.json(
        { error: 'targetType must be "discussion" or "comment"' },
        { status: 400 }
      );
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'value must be 1 or -1' },
        { status: 400 }
      );
    }

    const userId = await requireAuth();

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType,
          targetId,
        },
      },
    });

    let result;

    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        result = { action: 'removed', vote: null };
      } else {
        result = await prisma.vote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            value,
          },
        });
        result = { action: 'updated', vote: result };
      }
    } else {
      result = await prisma.vote.create({
        data: {
          userId,
          targetType,
          targetId,
          value,
        },
      });
      result = { action: 'created', vote: result };
    }

    const votes = await prisma.vote.findMany({
      where: {
        targetType,
        targetId,
      },
    });

    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;
    const voteCount = votes.reduce((sum, vote) => sum + vote.value, 0);

    if (targetType === 'discussion') {
      await prisma.discussion.update({
        where: { id: targetId },
        data: { upvotes, downvotes },
      });
    } else if (targetType === 'comment') {
      await prisma.comment.update({
        where: { id: targetId },
        data: { upvotes, downvotes },
      });
    }

    return NextResponse.json({
      ...result,
      voteCount,
      upvotes,
      downvotes,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to vote' },
        { status: 401 }
      );
    }
    console.error('Error handling vote:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to handle vote' },
      { status: 500 }
    );
  }
}


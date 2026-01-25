import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { discussionId, parentId, content } = await request.json();

    if (!discussionId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: discussionId, content' },
        { status: 400 }
      );
    }

    const userId = await requireAuth();

    const comment = await prisma.comment.create({
      data: {
        discussionId,
        userId,
        parentId: parentId || null,
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

    const votes = await prisma.vote.findMany({
      where: {
        targetType: 'comment',
        targetId: comment.id,
      },
    });

    const voteCount = votes.reduce((sum, vote) => sum + vote.value, 0);

    const upvotes = votes.filter(v => v.value === 1).length;
    const downvotes = votes.filter(v => v.value === -1).length;

    return NextResponse.json({
      ...comment,
      voteCount,
      upvotes,
      downvotes,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Please login to create comments' },
        { status: 401 }
      );
    }
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const discussionId = searchParams.get('discussionId');

    if (!discussionId) {
      return NextResponse.json(
        { error: 'Missing discussionId parameter' },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { discussionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const commentsWithVotes = await Promise.all(
      comments.map(async (comment) => {
        const votes = await prisma.vote.findMany({
          where: {
            targetType: 'comment',
            targetId: comment.id,
          },
        });

        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        const voteCount = votes.reduce((sum, vote) => sum + vote.value, 0);

        return {
          ...comment,
          voteCount,
          upvotes,
          downvotes,
        };
      })
    );

    interface CommentWithReplies {
      id: string;
      discussionId: string;
      userId: string;
      parentId: string | null;
      content: string;
      createdAt: Date;
      user: {
        id: string;
        username: string;
      };
      voteCount: number;
      replies: CommentWithReplies[];
    }

    const commentMap = new Map<string, CommentWithReplies>(
      commentsWithVotes.map(c => [c.id, { ...c, replies: [] as CommentWithReplies[] }])
    );
    const rootComments: CommentWithReplies[] = [];

    commentsWithVotes.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return NextResponse.json(rootComments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}


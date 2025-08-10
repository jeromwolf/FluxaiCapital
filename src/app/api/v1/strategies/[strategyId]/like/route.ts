import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST /api/v1/strategies/[strategyId]/like - Like a strategy
export async function POST(request: NextRequest, { params }: { params: { strategyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { strategyId } = params;

    // Check if strategy exists and is public
    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
      select: {
        id: true,
        userId: true,
        isPublic: true,
        name: true,
      },
    });

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Check if user has access (public or own strategy)
    if (!strategy.isPublic && strategy.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already liked
    const existingLike = await prisma.strategyLike.findUnique({
      where: {
        strategyId_userId: {
          strategyId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Strategy already liked' }, { status: 400 });
    }

    // Create like
    await prisma.strategyLike.create({
      data: {
        strategyId,
        userId: session.user.id,
      },
    });

    // Update shared strategy like count if exists
    await prisma.sharedStrategy.updateMany({
      where: { strategyId },
      data: { likeCount: { increment: 1 } },
    });

    // Create notification for strategy owner (if not liking own strategy)
    if (strategy.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: strategy.userId,
          senderId: session.user.id,
          type: 'STRATEGY_LIKE',
          title: 'New like on your strategy',
          message: `${session.user.name || 'Someone'} liked your strategy "${strategy.name}"`,
          data: {
            strategyId,
            strategyName: strategy.name,
            likerId: session.user.id,
            likerName: session.user.name,
          },
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.strategyLike.count({
      where: { strategyId },
    });

    return NextResponse.json({
      liked: true,
      likeCount,
    });
  } catch (error) {
    console.error('Error liking strategy:', error);
    return NextResponse.json({ error: 'Failed to like strategy' }, { status: 500 });
  }
}

// DELETE /api/v1/strategies/[strategyId]/like - Unlike a strategy
export async function DELETE(request: NextRequest, { params }: { params: { strategyId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { strategyId } = params;

    // Delete like
    const deleted = await prisma.strategyLike.deleteMany({
      where: {
        strategyId,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Update shared strategy like count if exists
    await prisma.sharedStrategy.updateMany({
      where: { strategyId },
      data: { likeCount: { decrement: 1 } },
    });

    // Get updated like count
    const likeCount = await prisma.strategyLike.count({
      where: { strategyId },
    });

    return NextResponse.json({
      liked: false,
      likeCount,
    });
  } catch (error) {
    console.error('Error unliking strategy:', error);
    return NextResponse.json({ error: 'Failed to unlike strategy' }, { status: 500 });
  }
}

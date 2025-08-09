import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating a strategy
const updateStrategySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  config: z.object({}).passthrough().optional(),
  rules: z.object({}).passthrough().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v1/strategies/[strategyId] - Get a specific strategy
export async function GET(
  request: NextRequest,
  { params }: { params: { strategyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { strategyId } = params;

    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            userProfile: {
              select: {
                avatarUrl: true,
                bio: true,
                reputation: true,
                followerCount: true,
                followingCount: true,
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            sharedStrategies: true,
          }
        },
        // Include if user has liked
        likes: session?.user?.id ? {
          where: {
            userId: session.user.id
          },
          select: { id: true }
        } : false,
        // Include recent performance
        performances: {
          orderBy: { date: 'desc' },
          take: 30,
        }
      }
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Check if user has access to private strategy
    if (!strategy.isPublic && strategy.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Increment view count if this is a shared strategy
    if (strategy.isPublic) {
      await prisma.sharedStrategy.updateMany({
        where: { strategyId },
        data: { viewCount: { increment: 1 } }
      });
    }

    // Check if current user follows the strategy creator
    let isFollowing = false;
    if (session?.user?.id && session.user.id !== strategy.userId) {
      const follow = await prisma.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: strategy.userId
          }
        }
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      strategy: {
        ...strategy,
        tags: strategy.tags as string[],
        isLiked: strategy.likes?.length > 0,
        likesCount: strategy._count.likes,
        commentsCount: strategy._count.comments,
        sharesCount: strategy._count.sharedStrategies,
        isFollowing,
      }
    });
  } catch (error) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/strategies/[strategyId] - Update a strategy
export async function PUT(
  request: NextRequest,
  { params }: { params: { strategyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { strategyId } = params;
    const body = await request.json();
    const validatedData = updateStrategySchema.parse(body);

    // Check if user owns the strategy
    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
      select: { userId: true }
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    if (strategy.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update the strategy
    const updatedStrategy = await prisma.strategy.update({
      where: { id: strategyId },
      data: {
        ...validatedData,
        version: { increment: 1 },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            sharedStrategies: true,
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'STRATEGY_UPDATE',
        action: `Updated strategy: ${updatedStrategy.name}`,
        metadata: {
          strategyId: updatedStrategy.id,
          version: updatedStrategy.version,
        }
      }
    });

    return NextResponse.json({
      strategy: {
        ...updatedStrategy,
        tags: updatedStrategy.tags as string[],
        likesCount: updatedStrategy._count.likes,
        commentsCount: updatedStrategy._count.comments,
        sharesCount: updatedStrategy._count.sharedStrategies,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { error: 'Failed to update strategy' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/strategies/[strategyId] - Delete a strategy
export async function DELETE(
  request: NextRequest,
  { params }: { params: { strategyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { strategyId } = params;

    // Check if user owns the strategy
    const strategy = await prisma.strategy.findUnique({
      where: { id: strategyId },
      select: { 
        userId: true,
        name: true,
      }
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found' },
        { status: 404 }
      );
    }

    if (strategy.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the strategy (cascade will handle related records)
    await prisma.strategy.delete({
      where: { id: strategyId }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'STRATEGY_DELETE',
        action: `Deleted strategy: ${strategy.name}`,
        metadata: {
          strategyId,
        }
      }
    });

    // Update user profile strategy count if exists
    await prisma.userProfile.updateMany({
      where: { userId: session.user.id },
      data: { 
        strategyCount: { decrement: 1 }
      }
    });

    return NextResponse.json({
      message: 'Strategy deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: 'Failed to delete strategy' },
      { status: 500 }
    );
  }
}
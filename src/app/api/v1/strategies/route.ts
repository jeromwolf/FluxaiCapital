import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating a strategy
const createStrategySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  type: z.enum(['AI_GENERATED', 'MANUAL', 'HYBRID', 'BACKTEST_ONLY']),
  config: z.object({}).passthrough(),
  rules: z.object({}).passthrough().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/v1/strategies - Get strategies (public feed or user's strategies)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';
    const type = searchParams.get('type');
    const riskLevel = searchParams.get('riskLevel');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    } else if (isPublic) {
      where.isPublic = true;
    } else if (session?.user?.id) {
      // If not public and no specific user, show user's own strategies
      where.userId = session.user.id;
    } else {
      // If not logged in and no specific filters, show public strategies
      where.isPublic = true;
    }

    if (type) {
      where.type = type;
    }

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    // Get strategies with user info and counts
    const [strategies, total] = await Promise.all([
      prisma.strategy.findMany({
        where,
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
                  reputation: true,
                  followerCount: true,
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
        },
        orderBy: {
          [sortBy]: order
        },
        skip,
        take: limit,
      }),
      prisma.strategy.count({ where })
    ]);

    // Transform the data
    const transformedStrategies = strategies.map(strategy => ({
      ...strategy,
      tags: strategy.tags as string[],
      isLiked: strategy.likes?.length > 0,
      likesCount: strategy._count.likes,
      commentsCount: strategy._count.comments,
      sharesCount: strategy._count.sharedStrategies,
    }));

    return NextResponse.json({
      strategies: transformedStrategies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}

// POST /api/v1/strategies - Create a new strategy
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createStrategySchema.parse(body);

    // Create the strategy
    const strategy = await prisma.strategy.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        config: validatedData.config,
        rules: validatedData.rules,
        riskLevel: validatedData.riskLevel || 'MEDIUM',
        tags: validatedData.tags || [],
        isPublic: validatedData.isPublic || false,
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
        type: 'STRATEGY_CREATE',
        action: `Created strategy: ${strategy.name}`,
        metadata: {
          strategyId: strategy.id,
          strategyType: strategy.type,
        }
      }
    });

    // Update user profile strategy count if exists
    await prisma.userProfile.updateMany({
      where: { userId: session.user.id },
      data: { 
        strategyCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      strategy: {
        ...strategy,
        tags: strategy.tags as string[],
        likesCount: strategy._count.likes,
        commentsCount: strategy._count.comments,
        sharesCount: strategy._count.sharedStrategies,
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating strategy:', error);
    return NextResponse.json(
      { error: 'Failed to create strategy' },
      { status: 500 }
    );
  }
}
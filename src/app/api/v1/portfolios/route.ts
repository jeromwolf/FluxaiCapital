import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { withApiMiddleware } from '@/lib/api/middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Validation schema
const createPortfolioSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  currency: z.string().default('KRW'),
  isActive: z.boolean().default(true),
});

// GET /api/v1/portfolios
export const GET = withApiMiddleware(
  async (request: NextRequest) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      const searchParams = request.nextUrl.searchParams;
      const userId = searchParams.get('userId');
      const isActive = searchParams.get('isActive');

      const where: any = {};
      if (userId) where.userId = userId;
      if (isActive !== null) where.isActive = isActive === 'true';

      const portfolios = await prisma.portfolio.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          holdings: true,
          _count: {
            select: {
              holdings: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: portfolios });
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch portfolios' },
        { status: 500 },
      );
    }
  },
  { validateCSRF: false },
); // GET requests don't need CSRF validation

// POST /api/v1/portfolios
export const POST = withApiMiddleware(async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const validatedData = createPortfolioSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const portfolio = await prisma.portfolio.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            holdings: true,
            transactions: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: validatedData.userId,
        type: 'PORTFOLIO_CREATE',
        action: `Created portfolio: ${portfolio.name}`,
        metadata: { portfolioId: portfolio.id },
      },
    });

    return NextResponse.json({ success: true, data: portfolio }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 },
      );
    }

    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create portfolio' },
      { status: 500 },
    );
  }
}); // POST requests will have CSRF validation by default

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const updatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ portfolioId: string }>;
}

// GET /api/v1/portfolios/[portfolioId]
export async function GET(_request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.portfolioId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        holdings: {
          orderBy: { marketValue: 'desc' },
        },
        transactions: {
          take: 10,
          orderBy: { executedAt: 'desc' },
        },
        performances: {
          take: 30,
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            holdings: true,
            transactions: true,
          },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ success: false, message: 'Portfolio not found' }, { status: 404 });
    }

    // Calculate total value
    const totalValue = portfolio.holdings.reduce(
      (sum, holding) => sum + Number(holding.marketValue),
      0,
    );

    // Calculate total PnL
    const totalUnrealizedPnL = portfolio.holdings.reduce(
      (sum, holding) => sum + Number(holding.unrealizedPnL),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        ...portfolio,
        summary: {
          totalValue,
          totalUnrealizedPnL,
          totalUnrealizedPnLPercentage:
            totalValue > 0 ? (totalUnrealizedPnL / totalValue) * 100 : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch portfolio' },
      { status: 500 },
    );
  }
}

// PATCH /api/v1/portfolios/[portfolioId]
export async function PATCH(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const body = await request.json();
    const validatedData = updatePortfolioSchema.parse(body);

    const portfolio = await prisma.portfolio.update({
      where: { id: params.portfolioId },
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
        userId: portfolio.userId,
        type: 'PORTFOLIO_UPDATE',
        action: `Updated portfolio: ${portfolio.name}`,
        metadata: { portfolioId: portfolio.id, updates: validatedData },
      },
    });

    return NextResponse.json({ success: true, data: portfolio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 },
      );
    }

    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update portfolio' },
      { status: 500 },
    );
  }
}

// DELETE /api/v1/portfolios/[portfolioId]
export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: params.portfolioId },
      select: { id: true, name: true, userId: true },
    });

    if (!portfolio) {
      return NextResponse.json({ success: false, message: 'Portfolio not found' }, { status: 404 });
    }

    await prisma.portfolio.delete({
      where: { id: params.portfolioId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: portfolio.userId,
        type: 'PORTFOLIO_DELETE',
        action: `Deleted portfolio: ${portfolio.name}`,
        metadata: { portfolioId: portfolio.id },
      },
    });

    return NextResponse.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete portfolio' },
      { status: 500 },
    );
  }
}

import { Decimal } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';

import { getMarketDataClient } from '@/lib/market/client';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ portfolioId: string }>;
}

// POST /api/v1/portfolios/[portfolioId]/holdings/update-prices
// Update all holdings with current market prices
export async function POST(_request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    // Get all holdings for the portfolio
    const holdings = await prisma.holding.findMany({
      where: { portfolioId: params.portfolioId },
    });

    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No holdings to update',
        data: { updated: 0 },
      });
    }

    // Get current market prices
    const marketClient = getMarketDataClient();
    const symbols = holdings.map((h) => h.symbol);
    const prices = await marketClient.getPrices(symbols);

    // Create a map for quick lookup
    const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

    // Update holdings with current prices
    const updatePromises = holdings.map(async (holding) => {
      const currentPrice = priceMap.get(holding.symbol);

      if (!currentPrice) {
        console.warn(`No price found for symbol: ${holding.symbol}`);
        return null;
      }

      const quantity = Number(holding.quantity);
      const averagePrice = Number(holding.averagePrice);
      const marketValue = quantity * currentPrice;
      const cost = quantity * averagePrice;
      const unrealizedPnL = marketValue - cost;

      return prisma.holding.update({
        where: { id: holding.id },
        data: {
          currentPrice: new Decimal(currentPrice),
          marketValue: new Decimal(marketValue),
          unrealizedPnL: new Decimal(unrealizedPnL),
          updatedAt: new Date(),
        },
      });
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter((r) => r !== null).length;

    // Calculate portfolio summary
    const updatedHoldings = await prisma.holding.findMany({
      where: { portfolioId: params.portfolioId },
    });

    const totalValue = updatedHoldings.reduce((sum, h) => sum + Number(h.marketValue), 0);
    const totalCost = updatedHoldings.reduce(
      (sum, h) => sum + Number(h.quantity) * Number(h.averagePrice),
      0,
    );
    const totalUnrealizedPnL = updatedHoldings.reduce((sum, h) => sum + Number(h.unrealizedPnL), 0);

    // Update portfolio performance
    await prisma.performance.create({
      data: {
        portfolioId: params.portfolioId,
        date: new Date(),
        totalValue: new Decimal(totalValue),
        dailyReturn: new Decimal(0), // Calculate based on previous day
        cumReturn: new Decimal(((totalValue - totalCost) / totalCost) * 100),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Holdings updated successfully',
      data: {
        updated: updatedCount,
        summary: {
          totalValue,
          totalCost,
          totalUnrealizedPnL,
          totalReturn: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error updating holdings prices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update holdings prices' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { getMarketDataClient } from '@/lib/market/client';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

// GET /api/v1/market/prices/[symbol]
export async function GET(_request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const symbol = params.symbol.toUpperCase();

    const marketClient = getMarketDataClient();
    const price = await marketClient.getPrice(symbol);

    if (!price) {
      return NextResponse.json(
        { success: false, message: `Symbol ${symbol} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: price,
    });
  } catch (error) {
    console.error('Error fetching market price:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch market price' },
      { status: 500 },
    );
  }
}

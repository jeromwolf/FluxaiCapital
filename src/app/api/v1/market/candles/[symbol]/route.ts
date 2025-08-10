import { NextRequest, NextResponse } from 'next/server';

import { getMarketDataClient } from '@/lib/market/client';

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

// GET /api/v1/market/candles/[symbol]?interval=1h&count=100
export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const symbol = params.symbol.toUpperCase();
    const { searchParams } = request.nextUrl;
    const interval = (searchParams.get('interval') as '1m' | '5m' | '1h' | '1d') || '1h';
    const count = Math.min(parseInt(searchParams.get('count') || '100'), 500);

    // Validate interval
    if (!['1m', '5m', '1h', '1d'].includes(interval)) {
      return NextResponse.json(
        { success: false, message: 'Invalid interval. Use 1m, 5m, 1h, or 1d' },
        { status: 400 },
      );
    }

    const marketClient = getMarketDataClient();
    const candles = await marketClient.getCandles(symbol, interval, count);

    if (candles.length === 0) {
      return NextResponse.json(
        { success: false, message: `No candle data found for ${symbol}` },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        interval,
        candles,
      },
    });
  } catch (error) {
    console.error('Error fetching candle data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch candle data' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getMarketDataClient } from '@/lib/market/client';

// GET /api/v1/market/prices?symbols=AAPL,MSFT,GOOGL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json(
        { success: false, message: 'symbols parameter is required' },
        { status: 400 },
      );
    }

    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (symbols.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one symbol is required' },
        { status: 400 },
      );
    }

    const marketClient = getMarketDataClient();
    const prices = await marketClient.getPrices(symbols);

    return NextResponse.json({
      success: true,
      data: prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch market prices' },
      { status: 500 },
    );
  }
}

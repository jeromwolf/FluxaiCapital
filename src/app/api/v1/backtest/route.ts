import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BacktestEngine } from '@/lib/backtest/engine';
import { momentumStrategy } from '@/lib/backtest/strategies/momentum';
import { meanReversionStrategy } from '@/lib/backtest/strategies/meanReversion';

const backtestSchema = z.object({
  strategyId: z.string(),
  symbols: z.array(z.string()).min(1),
  startDate: z.string(),
  endDate: z.string(),
  initialCapital: z.number().positive(),
  commission: z.number().min(0).max(100).default(0.1), // 0.1%
  slippage: z.number().min(0).max(100).default(0.05), // 0.05%
});

// Generate mock historical data
function generateMockPriceData(symbols: string[], startDate: Date, endDate: Date) {
  const priceData: Array<{ date: Date; symbol: string; price: number }> = [];
  const basePrices: Record<string, number> = {
    AAPL: 150,
    MSFT: 300,
    GOOGL: 100,
    NVDA: 400,
    TSLA: 200,
    '005930': 70000,
    '035420': 200000,
  };

  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    // Skip weekends
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      for (const symbol of symbols) {
        const basePrice = basePrices[symbol] || 100;
        const randomChange = (Math.random() - 0.5) * 0.02; // +/- 1% daily change
        const volatility = symbol === 'TSLA' || symbol === 'NVDA' ? 1.5 : 1;
        const trend = symbol === 'NVDA' ? 0.0002 : 0; // NVDA has slight upward trend

        const previousPrice =
          priceData.filter((p) => p.symbol === symbol).slice(-1)[0]?.price || basePrice;
        const newPrice = previousPrice * (1 + randomChange * volatility + trend);

        priceData.push({
          date: new Date(currentDate),
          symbol,
          price: Math.max(newPrice, 10), // Minimum price of 10
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return priceData;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = backtestSchema.parse(body);

    // Convert dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, message: 'Start date must be before end date' },
        { status: 400 },
      );
    }

    // Generate mock price data (in real app, fetch from market data API)
    const priceData = generateMockPriceData(validatedData.symbols, startDate, endDate);

    // Run backtest
    const engine = new BacktestEngine({
      strategyId: validatedData.strategyId,
      symbols: validatedData.symbols,
      startDate,
      endDate,
      initialCapital: validatedData.initialCapital,
      commission: validatedData.commission,
      slippage: validatedData.slippage,
    });

    const result = await engine.run(priceData);

    // Format dates for JSON response
    const formattedResult = {
      ...result,
      equityCurve: result.equityCurve.map((e) => ({
        ...e,
        date: e.date.toISOString(),
      })),
      trades: result.trades.map((t) => ({
        ...t,
        date: t.date.toISOString(),
      })),
      dailyReturns: result.dailyReturns.map((r) => ({
        ...r,
        date: r.date.toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedResult,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid data', errors: error.issues },
        { status: 400 },
      );
    }

    console.error('Error running backtest:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to run backtest',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET /api/v1/backtest - Get available strategies
export async function GET() {
  const strategies = [momentumStrategy, meanReversionStrategy];

  return NextResponse.json({
    success: true,
    data: strategies,
  });
}

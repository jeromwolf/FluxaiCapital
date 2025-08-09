import { NextRequest, NextResponse } from 'next/server';
import { MarketCandle } from '@/lib/market/types';
import { TimeFrame, TimeFrameConverter } from '@/lib/charting/trading-view-chart';

// Mock data generator for development
function generateMockCandles(
  symbol: string,
  timeframe: TimeFrame,
  from: number,
  to: number
): MarketCandle[] {
  const candles: MarketCandle[] = [];
  const intervalMs = TimeFrameConverter.getMilliseconds(timeframe);
  
  // Calculate base price based on symbol
  let basePrice = 100;
  if (symbol.includes('BTC')) basePrice = 45000;
  else if (symbol.includes('ETH')) basePrice = 3000;
  else if (symbol.includes('BNB')) basePrice = 300;
  else if (symbol.includes('SOL')) basePrice = 100;
  else if (symbol.includes('ADA')) basePrice = 0.5;
  
  // Generate candles
  let currentTime = from;
  while (currentTime <= to) {
    const volatility = 0.002; // 0.2% volatility per candle
    
    const open = basePrice;
    const change = (Math.random() - 0.5) * 2 * volatility;
    const high = open * (1 + Math.abs(change) + Math.random() * volatility);
    const low = open * (1 - Math.abs(change) - Math.random() * volatility);
    const close = open * (1 + change);
    const volume = Math.random() * 1000000 + 100000;
    
    candles.push({
      timestamp: currentTime,
      open,
      high,
      low,
      close,
      volume,
    });
    
    basePrice = close;
    currentTime += intervalMs;
  }
  
  return candles;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const timeframe = (searchParams.get('timeframe') || '1h') as TimeFrame;
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const limitParam = searchParams.get('limit');
    
    // Calculate time range
    const now = Date.now();
    const intervalMs = TimeFrameConverter.getMilliseconds(timeframe);
    const limit = limitParam ? parseInt(limitParam) : 500;
    
    let from = fromParam ? parseInt(fromParam) : now - (intervalMs * limit);
    let to = toParam ? parseInt(toParam) : now;
    
    // Ensure we don't request too much data
    const maxCandles = 5000;
    const requestedCandles = Math.ceil((to - from) / intervalMs);
    if (requestedCandles > maxCandles) {
      from = to - (intervalMs * maxCandles);
    }
    
    // In production, this would fetch from a real data provider
    // For now, we'll use mock data
    const candles = generateMockCandles(symbol, timeframe, from, to);
    
    // Simulate real-time updates by slightly modifying the last candle
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const timeSinceCandle = now - lastCandle.timestamp;
      const progress = Math.min(timeSinceCandle / intervalMs, 1);
      
      // Simulate price movement within the current candle
      const priceChange = (Math.random() - 0.5) * 0.001 * progress;
      lastCandle.close = lastCandle.close * (1 + priceChange);
      lastCandle.high = Math.max(lastCandle.high, lastCandle.close);
      lastCandle.low = Math.min(lastCandle.low, lastCandle.close);
      lastCandle.volume += Math.random() * 10000 * progress;
    }
    
    return NextResponse.json({
      symbol,
      timeframe,
      candles,
      from,
      to,
      count: candles.length,
      hasMore: true, // In production, check if more historical data is available
    });
  } catch (error) {
    console.error('Error fetching candles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}

// WebSocket endpoint for real-time updates would be handled separately
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbol, timeframe } = body;
    
    if (action === 'subscribe') {
      // In production, this would register the client for real-time updates
      return NextResponse.json({
        success: true,
        message: `Subscribed to ${symbol} ${timeframe} updates`,
        subscription: {
          id: `sub_${Date.now()}`,
          symbol,
          timeframe,
        },
      });
    } else if (action === 'unsubscribe') {
      // In production, this would remove the subscription
      return NextResponse.json({
        success: true,
        message: `Unsubscribed from ${symbol} ${timeframe} updates`,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
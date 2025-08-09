import { NextRequest, NextResponse } from 'next/server';
import { SocialSentimentService } from '@/lib/social/social-sentiment-service';

const sentimentService = new SocialSentimentService();

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Get company name from query params if provided
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get('company');

    // Fetch sentiment data
    const sentimentData = await sentimentService.getStockSentiment(
      symbol.toUpperCase(),
      companyName || undefined
    );

    return NextResponse.json(sentimentData);
  } catch (error) {
    console.error('Error fetching stock sentiment:', error);
    
    // Return mock data for development if API fails
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getMockStockSentiment(params.symbol));
    }

    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockStockSentiment(symbol: string) {
  const sentiments = ['bullish', 'bearish', 'neutral'] as const;
  const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  const score = randomSentiment === 'bullish' ? 45 : randomSentiment === 'bearish' ? -35 : 5;

  return {
    symbol: symbol.toUpperCase(),
    sentiment: {
      current: randomSentiment,
      score,
      confidence: 75 + Math.random() * 20,
    },
    metrics: {
      tweetVolume: Math.floor(1000 + Math.random() * 9000),
      engagement: 2.5 + Math.random() * 3,
      reach: Math.floor(50000 + Math.random() * 450000),
      influencerActivity: 15 + Math.random() * 35,
    },
    trends: {
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        sentiment: score + (Math.random() - 0.5) * 20,
        volume: Math.floor(50 + Math.random() * 200),
      })),
      daily: Array.from({ length: 7 }, (_, i) => ({
        time: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        sentiment: score + (Math.random() - 0.5) * 30,
        volume: Math.floor(500 + Math.random() * 2000),
      })),
    },
    topTweets: [
      {
        id: '1',
        text: `$${symbol} is showing strong momentum! Technical indicators looking bullish with support at key levels. 📈`,
        author: 'TradingGuru',
        engagement: 1250,
        sentiment: 'positive',
      },
      {
        id: '2',
        text: `Cautious on $${symbol} here. Valuations are stretched and seeing some distribution at these levels.`,
        author: 'MarketAnalyst',
        engagement: 890,
        sentiment: 'negative',
      },
      {
        id: '3',
        text: `$${symbol} earnings beat expectations! Revenue up 15% YoY. Guidance raised for next quarter. 🚀`,
        author: 'FinanceNews',
        engagement: 2100,
        sentiment: 'positive',
      },
      {
        id: '4',
        text: `Watching $${symbol} for a potential breakout. Volume picking up and RSI showing strength.`,
        author: 'ChartMaster',
        engagement: 650,
        sentiment: 'neutral',
      },
      {
        id: '5',
        text: `Risk/reward on $${symbol} not favorable at current levels. Taking profits and waiting for pullback.`,
        author: 'RiskManager',
        engagement: 430,
        sentiment: 'negative',
      },
    ],
    keywords: [
      'earnings', 'momentum', 'breakout', 'support', 'resistance',
      'bullish', 'volume', 'technical', 'valuation', 'guidance'
    ],
    lastUpdated: new Date(),
  };
}
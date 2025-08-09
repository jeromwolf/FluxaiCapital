import { NextResponse } from 'next/server';
import { SocialSentimentService } from '@/lib/social/social-sentiment-service';

const sentimentService = new SocialSentimentService();

export async function GET() {
  try {
    // Fetch market-wide sentiment data
    const marketSentiment = await sentimentService.getMarketSentiment();

    return NextResponse.json(marketSentiment);
  } catch (error) {
    console.error('Error fetching market sentiment:', error);

    // Return mock data for development if API fails
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getMockMarketSentiment());
    }

    return NextResponse.json({ error: 'Failed to fetch market sentiment' }, { status: 500 });
  }
}

// Mock data for development
function getMockMarketSentiment() {
  const overallSentiment =
    Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral';
  const score = overallSentiment === 'bullish' ? 25 : overallSentiment === 'bearish' ? -15 : 5;

  return {
    overall: {
      sentiment: overallSentiment,
      score,
      momentum: Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable',
    },
    sectors: {
      tech: {
        sentiment: 35 + (Math.random() - 0.5) * 40,
        volume: Math.floor(5000 + Math.random() * 10000),
        topStocks: ['AAPL', 'MSFT', 'NVDA'],
      },
      finance: {
        sentiment: -10 + (Math.random() - 0.5) * 30,
        volume: Math.floor(3000 + Math.random() * 7000),
        topStocks: ['JPM', 'BAC', 'GS'],
      },
      energy: {
        sentiment: 15 + (Math.random() - 0.5) * 35,
        volume: Math.floor(2000 + Math.random() * 5000),
        topStocks: ['XOM', 'CVX', 'COP'],
      },
      healthcare: {
        sentiment: 5 + (Math.random() - 0.5) * 25,
        volume: Math.floor(2500 + Math.random() * 6000),
        topStocks: ['JNJ', 'UNH', 'PFE'],
      },
      consumer: {
        sentiment: 20 + (Math.random() - 0.5) * 30,
        volume: Math.floor(4000 + Math.random() * 8000),
        topStocks: ['AMZN', 'TSLA', 'WMT'],
      },
    },
    trendingTopics: [
      {
        topic: '#TechEarnings',
        sentiment: 45,
        volume: 15000,
      },
      {
        topic: '$BTC',
        sentiment: 65,
        volume: 25000,
      },
      {
        topic: '#FedMeeting',
        sentiment: -20,
        volume: 12000,
      },
      {
        topic: '#AIStocks',
        sentiment: 55,
        volume: 18000,
      },
      {
        topic: '#Inflation',
        sentiment: -35,
        volume: 10000,
      },
      {
        topic: '$TSLA',
        sentiment: 30,
        volume: 20000,
      },
      {
        topic: '#CryptoNews',
        sentiment: 40,
        volume: 16000,
      },
      {
        topic: '#MarketCrash',
        sentiment: -60,
        volume: 8000,
      },
    ],
    influencerSentiment: [
      {
        username: 'jimcramer',
        followerCount: 2100000,
        recentSentiment: 35,
      },
      {
        username: 'ReformedBroker',
        followerCount: 1400000,
        recentSentiment: 15,
      },
      {
        username: 'charliebilello',
        followerCount: 480000,
        recentSentiment: -10,
      },
      {
        username: 'hmeisler',
        followerCount: 180000,
        recentSentiment: 25,
      },
    ],
    timestamp: new Date(),
  };
}

import { getTwitterClient, TwitterApiClient } from './twitter-api';
import { SentimentAnalyzer } from './sentiment-analyzer';

interface StockSentiment {
  symbol: string;
  companyName?: string;
  sentiment: {
    current: 'bullish' | 'bearish' | 'neutral';
    score: number; // -100 to 100
    confidence: number; // 0 to 100
  };
  metrics: {
    tweetVolume: number;
    engagement: number;
    reach: number;
    influencerActivity: number;
  };
  trends: {
    hourly: Array<{ time: string; sentiment: number; volume: number }>;
    daily: Array<{ time: string; sentiment: number; volume: number }>;
  };
  topTweets: Array<{
    id: string;
    text: string;
    author: string;
    engagement: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  keywords: string[];
  lastUpdated: Date;
}

interface MarketSentimentSnapshot {
  overall: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    momentum: 'increasing' | 'decreasing' | 'stable';
  };
  sectors: Record<
    string,
    {
      sentiment: number;
      volume: number;
      topStocks: string[];
    }
  >;
  trendingTopics: Array<{
    topic: string;
    sentiment: number;
    volume: number;
  }>;
  influencerSentiment: Array<{
    username: string;
    followerCount: number;
    recentSentiment: number;
  }>;
  timestamp: Date;
}

export class SocialSentimentService {
  private twitterClient: TwitterApiClient;
  private sentimentAnalyzer: SentimentAnalyzer;
  private cache: Map<string, { data: any; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.twitterClient = getTwitterClient();
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  /**
   * Get comprehensive sentiment analysis for a stock
   */
  async getStockSentiment(symbol: string, companyName?: string): Promise<StockSentiment> {
    const cacheKey = `stock_${symbol}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build search query
      const query = this.twitterClient.buildStockQuery(symbol, companyName);

      // Fetch recent tweets
      const searchResult = await this.twitterClient.searchTweets({
        query,
        maxResults: 100,
      });

      // Analyze sentiment for each tweet
      const tweetsWithSentiment = searchResult.tweets.map((tweet) => {
        const analysis = this.sentimentAnalyzer.analyzeSentiment(tweet.text);
        return {
          ...tweet,
          sentiment: analysis.sentiment,
          sentimentScore: analysis.score,
        };
      });

      // Calculate overall metrics
      const sentimentMetrics = this.twitterClient.calculateEngagementMetrics(tweetsWithSentiment);
      const marketSentiment = this.sentimentAnalyzer.analyzeMarketSentiment(
        tweetsWithSentiment.map((t) => t.text),
      );

      // Get volume trends
      const volumeTrends = await this.getVolumeTrends(query);

      // Sort tweets by engagement
      const topTweets = tweetsWithSentiment
        .sort((a, b) => {
          const engagementA = a.metrics.likeCount + a.metrics.retweetCount;
          const engagementB = b.metrics.likeCount + b.metrics.retweetCount;
          return engagementB - engagementA;
        })
        .slice(0, 5)
        .map((tweet) => ({
          id: tweet.id,
          text: tweet.text,
          author: tweet.authorUsername || 'Unknown',
          engagement: tweet.metrics.likeCount + tweet.metrics.retweetCount,
          sentiment: tweet.sentiment || 'neutral',
        }));

      // Extract keywords from all tweets
      const allKeywords: string[] = [];
      for (const tweet of tweetsWithSentiment) {
        const analysis = this.sentimentAnalyzer.analyzeSentiment(tweet.text);
        allKeywords.push(...analysis.keywords);
      }

      const keywords = this.getTopKeywords(allKeywords, 10);

      const result: StockSentiment = {
        symbol,
        companyName,
        sentiment: {
          current:
            marketSentiment.momentum > 10
              ? 'bullish'
              : marketSentiment.momentum < -10
                ? 'bearish'
                : 'neutral',
          score: marketSentiment.momentum,
          confidence: marketSentiment.confidence * 100,
        },
        metrics: {
          tweetVolume: searchResult.resultCount,
          engagement: sentimentMetrics.engagementRate,
          reach: tweetsWithSentiment.reduce((sum, t) => sum + (t.metrics.impressionCount || 0), 0),
          influencerActivity: this.calculateInfluencerActivity(tweetsWithSentiment),
        },
        trends: volumeTrends,
        topTweets,
        keywords,
        lastUpdated: new Date(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting stock sentiment:', error);
      throw error;
    }
  }

  /**
   * Get market-wide sentiment snapshot
   */
  async getMarketSentiment(): Promise<MarketSentimentSnapshot> {
    const cacheKey = 'market_sentiment';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Get trending finance topics
      const trendingTopics = await this.twitterClient.getTrendingFinanceTopics();

      // Analyze sentiment for trending topics
      const topicsWithSentiment = await Promise.all(
        trendingTopics.slice(0, 10).map(async (topic) => {
          const tweets = await this.twitterClient.searchTweets({
            query: topic.query,
            maxResults: 50,
          });

          const sentiment = this.sentimentAnalyzer.analyzeMarketSentiment(
            tweets.tweets.map((t) => t.text),
          );

          return {
            topic: topic.name,
            sentiment: sentiment.momentum,
            volume: topic.tweetVolume || 0,
          };
        }),
      );

      // Get overall market sentiment
      const overallSentiment = this.calculateOverallSentiment(topicsWithSentiment);

      // Get sector sentiments
      const sectorSentiments = await this.getSectorSentiments();

      // Get influencer sentiments
      const influencerSentiments = await this.getInfluencerSentiments();

      const result: MarketSentimentSnapshot = {
        overall: overallSentiment,
        sectors: sectorSentiments,
        trendingTopics: topicsWithSentiment,
        influencerSentiment: influencerSentiments,
        timestamp: new Date(),
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting market sentiment:', error);
      throw error;
    }
  }

  /**
   * Monitor sentiment changes in real-time
   */
  async *monitorSentimentChanges(
    symbols: string[],
    intervalMs: number = 60000,
  ): AsyncGenerator<{
    symbol: string;
    previousSentiment: number;
    currentSentiment: number;
    change: number;
    alert?: string;
  }> {
    const previousSentiments: Record<string, number> = {};

    while (true) {
      for (const symbol of symbols) {
        try {
          const sentiment = await this.getStockSentiment(symbol);
          const currentScore = sentiment.sentiment.score;
          const previousScore = previousSentiments[symbol] || currentScore;
          const change = currentScore - previousScore;

          let alert: string | undefined;
          if (Math.abs(change) > 20) {
            alert =
              change > 0
                ? `Significant positive sentiment shift for ${symbol}`
                : `Significant negative sentiment shift for ${symbol}`;
          }

          yield {
            symbol,
            previousSentiment: previousScore,
            currentSentiment: currentScore,
            change,
            alert,
          };

          previousSentiments[symbol] = currentScore;
        } catch (error) {
          console.error(`Error monitoring ${symbol}:`, error);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Get sentiment correlation with price movements
   */
  async getSentimentPriceCorrelation(
    symbol: string,
    priceData: Array<{ time: string; price: number }>,
    days: number = 7,
  ): Promise<{
    correlation: number;
    leadTime: number; // Hours sentiment leads/lags price
    accuracy: number;
  }> {
    try {
      const query = this.twitterClient.buildStockQuery(symbol);
      const volumeMetrics = await this.twitterClient.getVolumeMetrics(query, 'hour', days);

      // Get sentiment for each time period
      const sentimentData: Array<{ time: string; sentiment: number }> = [];

      for (const metric of volumeMetrics) {
        const tweets = await this.twitterClient.searchTweets({
          query,
          maxResults: 50,
          startTime: new Date(metric.time),
          endTime: new Date(new Date(metric.time).getTime() + 60 * 60 * 1000),
        });

        const sentiment = this.sentimentAnalyzer.analyzeMarketSentiment(
          tweets.tweets.map((t) => t.text),
        );

        sentimentData.push({
          time: metric.time,
          sentiment: sentiment.momentum,
        });
      }

      // Calculate correlation with different lead/lag times
      const correlations: Array<{ leadTime: number; correlation: number }> = [];

      for (let leadTime = -24; leadTime <= 24; leadTime += 1) {
        const correlation = this.calculateCorrelation(sentimentData, priceData, leadTime);
        correlations.push({ leadTime, correlation });
      }

      // Find best correlation
      const best = correlations.reduce((prev, current) =>
        Math.abs(current.correlation) > Math.abs(prev.correlation) ? current : prev,
      );

      return {
        correlation: best.correlation,
        leadTime: best.leadTime,
        accuracy: Math.abs(best.correlation) * 100,
      };
    } catch (error) {
      console.error('Error calculating sentiment-price correlation:', error);
      throw error;
    }
  }

  /**
   * Get volume trends for a query
   */
  private async getVolumeTrends(query: string): Promise<{
    hourly: Array<{ time: string; sentiment: number; volume: number }>;
    daily: Array<{ time: string; sentiment: number; volume: number }>;
  }> {
    try {
      const [hourlyVolume, dailyVolume] = await Promise.all([
        this.twitterClient.getVolumeMetrics(query, 'hour', 1),
        this.twitterClient.getVolumeMetrics(query, 'day', 7),
      ]);

      // For now, return volume data with neutral sentiment
      // In production, you'd fetch and analyze tweets for each period
      return {
        hourly: hourlyVolume.map((v) => ({
          time: v.time,
          sentiment: 0,
          volume: v.count,
        })),
        daily: dailyVolume.map((v) => ({
          time: v.time,
          sentiment: 0,
          volume: v.count,
        })),
      };
    } catch (error) {
      console.error('Error getting volume trends:', error);
      return { hourly: [], daily: [] };
    }
  }

  /**
   * Calculate influencer activity score
   */
  private calculateInfluencerActivity(tweets: any[]): number {
    // Simple heuristic: high engagement tweets indicate influencer activity
    const highEngagementTweets = tweets.filter((tweet) => {
      const engagement = tweet.metrics.likeCount + tweet.metrics.retweetCount;
      return engagement > 100;
    });

    return (highEngagementTweets.length / tweets.length) * 100;
  }

  /**
   * Get top keywords by frequency
   */
  private getTopKeywords(keywords: string[], limit: number): string[] {
    const frequency: Record<string, number> = {};

    for (const keyword of keywords) {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    }

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([keyword]) => keyword);
  }

  /**
   * Calculate overall market sentiment
   */
  private calculateOverallSentiment(topics: Array<{ sentiment: number; volume: number }>): {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    momentum: 'increasing' | 'decreasing' | 'stable';
  } {
    if (topics.length === 0) {
      return { sentiment: 'neutral', score: 0, momentum: 'stable' };
    }

    const weightedSum = topics.reduce((sum, topic) => sum + topic.sentiment * topic.volume, 0);
    const totalVolume = topics.reduce((sum, topic) => sum + topic.volume, 0);
    const score = totalVolume > 0 ? weightedSum / totalVolume : 0;

    return {
      sentiment: score > 10 ? 'bullish' : score < -10 ? 'bearish' : 'neutral',
      score,
      momentum: 'stable', // Would need historical data to determine
    };
  }

  /**
   * Get sector-specific sentiments
   */
  private async getSectorSentiments(): Promise<
    Record<
      string,
      {
        sentiment: number;
        volume: number;
        topStocks: string[];
      }
    >
  > {
    const sectors = {
      tech: ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
      finance: ['JPM', 'BAC', 'GS', 'MS', 'WFC'],
      energy: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
      healthcare: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO'],
      consumer: ['AMZN', 'TSLA', 'WMT', 'HD', 'MCD'],
    };

    const sectorSentiments: Record<string, any> = {};

    // In production, fetch real sentiment for each sector
    for (const [sector, stocks] of Object.entries(sectors)) {
      sectorSentiments[sector] = {
        sentiment: Math.random() * 200 - 100, // Placeholder
        volume: Math.floor(Math.random() * 10000),
        topStocks: stocks.slice(0, 3),
      };
    }

    return sectorSentiments;
  }

  /**
   * Get sentiment from financial influencers
   */
  private async getInfluencerSentiments(): Promise<
    Array<{
      username: string;
      followerCount: number;
      recentSentiment: number;
    }>
  > {
    const influencers = [
      { username: 'jimcramer', followerCount: 2100000 },
      { username: 'ReformedBroker', followerCount: 1400000 },
      { username: 'charliebilello', followerCount: 480000 },
      { username: 'hmeisler', followerCount: 180000 },
    ];

    const results = [];

    for (const influencer of influencers) {
      try {
        const tweets = await this.twitterClient.getInfluencerTweets(influencer.username, 10);

        const sentiment = this.sentimentAnalyzer.analyzeMarketSentiment(tweets.map((t) => t.text));

        results.push({
          username: influencer.username,
          followerCount: influencer.followerCount,
          recentSentiment: sentiment.momentum,
        });
      } catch (error) {
        console.error(`Error getting influencer sentiment for ${influencer.username}:`, error);
      }
    }

    return results;
  }

  /**
   * Calculate correlation between two time series
   */
  private calculateCorrelation(
    sentimentData: Array<{ time: string; sentiment: number }>,
    priceData: Array<{ time: string; price: number }>,
    leadTimeHours: number,
  ): number {
    // Simple correlation calculation
    // In production, use proper statistical methods
    return Math.random() * 2 - 1; // Placeholder
  }

  /**
   * Cache management
   */
  private getCached(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp.getTime();
    if (age > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: new Date() });
  }
}

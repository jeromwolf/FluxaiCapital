import { TwitterApi } from 'twitter-api-v2';

interface TwitterConfig {
  bearerToken: string;
}

interface TweetSearchParams {
  query: string;
  maxResults?: number;
  startTime?: Date;
  endTime?: Date;
}

interface TweetMetrics {
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  quoteCount: number;
  impressionCount?: number;
}

interface Tweet {
  id: string;
  text: string;
  authorId: string;
  authorName?: string;
  authorUsername?: string;
  createdAt: string;
  metrics: TweetMetrics;
  sentiment?: 'positive' | 'negative' | 'neutral';
  sentimentScore?: number;
}

interface TweetSearchResult {
  tweets: Tweet[];
  resultCount: number;
  nextToken?: string;
}

interface TrendingTopic {
  name: string;
  url: string;
  tweetVolume: number | null;
  query: string;
}

interface SentimentMetrics {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  tweetCount: number;
  engagementRate: number;
}

export class TwitterApiClient {
  private client: TwitterApi;
  private rateLimitRemaining: number = 180;
  private rateLimitReset: Date = new Date();

  constructor(config: TwitterConfig) {
    this.client = new TwitterApi(config.bearerToken);
  }

  /**
   * Search tweets about a stock or company
   */
  async searchTweets(params: TweetSearchParams): Promise<TweetSearchResult> {
    try {
      await this.checkRateLimit();

      const searchParams: any = {
        query: params.query,
        max_results: params.maxResults || 100,
        'tweet.fields': 'created_at,author_id,public_metrics,context_annotations,entities',
        'user.fields': 'name,username,verified',
        expansions: 'author_id',
      };

      if (params.startTime) {
        searchParams.start_time = params.startTime.toISOString();
      }

      if (params.endTime) {
        searchParams.end_time = params.endTime.toISOString();
      }

      const response = await this.client.v2.search(params.query, searchParams);

      this.updateRateLimits(response);

      const tweets: Tweet[] = [];

      if (response.data && response.data.data) {
        for (const tweet of response.data.data) {
          const author = response.includes?.users?.find((user: any) => user.id === tweet.author_id);

          tweets.push({
            id: tweet.id,
            text: tweet.text,
            authorId: tweet.author_id || '',
            authorName: author?.name,
            authorUsername: author?.username,
            createdAt: tweet.created_at || new Date().toISOString(),
            metrics: {
              likeCount: tweet.public_metrics?.like_count || 0,
              retweetCount: tweet.public_metrics?.retweet_count || 0,
              replyCount: tweet.public_metrics?.reply_count || 0,
              quoteCount: tweet.public_metrics?.quote_count || 0,
              impressionCount: tweet.public_metrics?.impression_count,
            },
          });
        }
      }

      return {
        tweets,
        resultCount: response.meta?.result_count || 0,
        nextToken: response.meta?.next_token,
      };
    } catch (error) {
      console.error('Twitter API search error:', error);
      throw new Error(
        `Failed to search tweets: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get trending topics in finance
   */
  async getTrendingFinanceTopics(woeid: number = 1): Promise<TrendingTopic[]> {
    try {
      await this.checkRateLimit();

      // TODO: Fix Twitter API method call
      // const response = await this.client.v1.trends({ id: woeid });

      // Mock response for now
      const response: any = {
        trends: [
          { name: 'Tesla', tweet_volume: 50000 },
          { name: 'Bitcoin', tweet_volume: 35000 },
          { name: 'Stock Market', tweet_volume: 25000 },
        ],
      };

      const financeKeywords = [
        'stock',
        'crypto',
        'bitcoin',
        'ethereum',
        'market',
        'trading',
        'invest',
        'finance',
        'economy',
        'nasdaq',
        'dow',
        'sp500',
        'bank',
        'dollar',
        'euro',
        'yen',
        'gold',
        'oil',
        'commodity',
      ];

      const financeTrends: TrendingTopic[] = [];

      if (response && Array.isArray(response)) {
        for (const location of response) {
          if (location.trends) {
            for (const trend of location.trends) {
              const trendName = trend.name.toLowerCase();
              const isFinanceRelated = financeKeywords.some((keyword) =>
                trendName.includes(keyword),
              );

              if (isFinanceRelated) {
                financeTrends.push({
                  name: trend.name,
                  url: trend.url,
                  tweetVolume: trend.tweet_volume || null,
                  query: trend.query,
                });
              }
            }
          }
        }
      }

      return financeTrends.sort((a, b) => (b.tweetVolume || 0) - (a.tweetVolume || 0));
    } catch (error) {
      console.error('Twitter API trending error:', error);
      throw new Error(
        `Failed to get trending topics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get user timeline for influential finance accounts
   */
  async getInfluencerTweets(username: string, maxResults: number = 10): Promise<Tweet[]> {
    try {
      await this.checkRateLimit();

      const user = await this.client.v2.userByUsername(username);
      if (!user.data) {
        throw new Error('User not found');
      }

      const timeline = await this.client.v2.userTimeline(user.data.id, {
        max_results: maxResults,
        'tweet.fields': 'created_at,public_metrics',
        exclude: ['retweets', 'replies'],
      });

      this.updateRateLimits(timeline);

      const tweets: Tweet[] = [];

      if (timeline.data && timeline.data.data) {
        for (const tweet of timeline.data.data) {
          tweets.push({
            id: tweet.id,
            text: tweet.text,
            authorId: user.data.id,
            authorName: user.data.name,
            authorUsername: user.data.username,
            createdAt: tweet.created_at || new Date().toISOString(),
            metrics: {
              likeCount: tweet.public_metrics?.like_count || 0,
              retweetCount: tweet.public_metrics?.retweet_count || 0,
              replyCount: tweet.public_metrics?.reply_count || 0,
              quoteCount: tweet.public_metrics?.quote_count || 0,
              impressionCount: tweet.public_metrics?.impression_count,
            },
          });
        }
      }

      return tweets;
    } catch (error) {
      console.error('Twitter API user timeline error:', error);
      throw new Error(
        `Failed to get user timeline: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Calculate engagement metrics for tweets
   */
  calculateEngagementMetrics(tweets: Tweet[]): SentimentMetrics {
    if (tweets.length === 0) {
      return {
        positive: 0,
        negative: 0,
        neutral: 0,
        averageScore: 0,
        tweetCount: 0,
        engagementRate: 0,
      };
    }

    let totalEngagement = 0;
    let totalImpressions = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    let totalSentimentScore = 0;

    for (const tweet of tweets) {
      // Calculate engagement
      const engagement =
        tweet.metrics.likeCount +
        tweet.metrics.retweetCount +
        tweet.metrics.replyCount +
        tweet.metrics.quoteCount;

      totalEngagement += engagement;

      if (tweet.metrics.impressionCount) {
        totalImpressions += tweet.metrics.impressionCount;
      }

      // Count sentiment
      if (tweet.sentiment) {
        switch (tweet.sentiment) {
          case 'positive':
            positiveCount++;
            break;
          case 'negative':
            negativeCount++;
            break;
          case 'neutral':
            neutralCount++;
            break;
        }
      }

      if (tweet.sentimentScore !== undefined) {
        totalSentimentScore += tweet.sentimentScore;
      }
    }

    const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

    return {
      positive: (positiveCount / tweets.length) * 100,
      negative: (negativeCount / tweets.length) * 100,
      neutral: (neutralCount / tweets.length) * 100,
      averageScore: totalSentimentScore / tweets.length,
      tweetCount: tweets.length,
      engagementRate,
    };
  }

  /**
   * Build search query for stock/crypto symbols
   */
  buildStockQuery(symbol: string, companyName?: string): string {
    const queries: string[] = [`$${symbol}`];

    if (companyName) {
      queries.push(`"${companyName}"`);
    }

    // Add common financial terms
    const financialTerms = ['stock', 'price', 'trading', 'invest', 'buy', 'sell'];
    const expandedQuery = queries
      .map((q) => `(${q} (${financialTerms.join(' OR ')}))`)
      .join(' OR ');

    // Exclude spam and promotional content
    return `${expandedQuery} -is:retweet -is:reply -giveaway -promo lang:en`;
  }

  /**
   * Get volume metrics over time
   */
  async getVolumeMetrics(
    query: string,
    granularity: 'hour' | 'day' = 'hour',
    days: number = 7,
  ): Promise<Array<{ time: string; count: number }>> {
    try {
      await this.checkRateLimit();

      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - days);

      // TODO: Fix Twitter API response structure
      // Mock response for now
      const metrics: Array<{ time: string; count: number }> = [];

      // Generate mock hourly data
      const hoursDiff = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
      for (let i = 0; i < hoursDiff; i++) {
        const time = new Date(startTime.getTime() + i * 60 * 60 * 1000);
        metrics.push({
          time: time.toISOString(),
          count: Math.floor(Math.random() * 100) + 10,
        });
      }

      return metrics;
    } catch (error) {
      console.error('Twitter API volume metrics error:', error);
      throw new Error(
        `Failed to get volume metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check and wait for rate limits
   */
  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 1 && this.rateLimitReset > new Date()) {
      const waitTime = this.rateLimitReset.getTime() - Date.now();
      console.log(`Rate limit reached. Waiting ${waitTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimits(response: any): void {
    if (response.rateLimit) {
      this.rateLimitRemaining = response.rateLimit.remaining;
      this.rateLimitReset = new Date(response.rateLimit.reset * 1000);
    }
  }
}

// Singleton instance
let twitterClient: TwitterApiClient | null = null;

export function getTwitterClient(): TwitterApiClient {
  if (!twitterClient) {
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      throw new Error('TWITTER_BEARER_TOKEN is not configured');
    }
    twitterClient = new TwitterApiClient({ bearerToken });
  }
  return twitterClient;
}

'use client';

import { TrendingUp, TrendingDown, Activity, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SentimentData {
  symbol: string;
  sentiment: {
    current: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
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
}

interface MarketSentimentData {
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
}

interface SocialSentimentProps {
  symbol?: string;
  className?: string;
}

export function SocialSentiment({ symbol, className }: SocialSentimentProps) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);

      if (symbol) {
        const response = await fetch(`/api/v1/social/sentiment/${symbol}`);
        const data = await response.json();
        setSentimentData(data);
      } else {
        const response = await fetch('/api/v1/social/market-sentiment');
        const data = await response.json();
        setMarketSentiment(data);
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
      case 'positive':
        return 'text-green-500';
      case 'bearish':
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'bearish':
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">Loading sentiment data...</div>
        </CardContent>
      </Card>
    );
  }

  if (symbol && sentimentData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Social Sentiment - {symbol}</span>
            <Badge variant="outline" className={getSentimentColor(sentimentData.sentiment.current)}>
              {getSentimentIcon(sentimentData.sentiment.current)}
              <span className="ml-1 capitalize">{sentimentData.sentiment.current}</span>
            </Badge>
          </CardTitle>
          <CardDescription>Real-time sentiment analysis from social media</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="tweets">Top Tweets</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Sentiment Score</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {sentimentData.sentiment.score > 0 ? '+' : ''}
                      {sentimentData.sentiment.score.toFixed(1)}
                    </div>
                    <Progress value={50 + sentimentData.sentiment.score / 2} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Confidence</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">
                      {sentimentData.sentiment.confidence.toFixed(0)}%
                    </div>
                    <Progress value={sentimentData.sentiment.confidence} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Volume
                  </div>
                  <div className="text-xl font-semibold">
                    {sentimentData.metrics.tweetVolume.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    Engagement
                  </div>
                  <div className="text-xl font-semibold">
                    {sentimentData.metrics.engagement.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Reach
                  </div>
                  <div className="text-xl font-semibold">
                    {(sentimentData.metrics.reach / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Influencers
                  </div>
                  <div className="text-xl font-semibold">
                    {sentimentData.metrics.influencerActivity.toFixed(0)}%
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Hourly Sentiment Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentData.trends.hourly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tickFormatter={(time) =>
                          new Date(time).toLocaleTimeString([], { hour: '2-digit' })
                        }
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sentiment"
                        stroke="#8884d8"
                        name="Sentiment"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="volume"
                        stroke="#82ca9d"
                        name="Volume"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Daily Sentiment Trend</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sentimentData.trends.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        tickFormatter={(time) =>
                          new Date(time).toLocaleDateString([], { weekday: 'short' })
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sentiment" fill="#3b82f6" name="Sentiment" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tweets" className="space-y-4">
              {sentimentData.topTweets.map((tweet) => (
                <div key={tweet.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">@{tweet.author}</div>
                    <Badge variant="outline" className={getSentimentColor(tweet.sentiment)}>
                      {tweet.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm">{tweet.text}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Activity className="h-4 w-4 mr-1" />
                    {tweet.engagement.toLocaleString()} engagements
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {sentimentData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  if (!symbol && marketSentiment) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Market Sentiment</span>
            <Badge
              variant="outline"
              className={getSentimentColor(marketSentiment.overall.sentiment)}
            >
              {getSentimentIcon(marketSentiment.overall.sentiment)}
              <span className="ml-1 capitalize">{marketSentiment.overall.sentiment}</span>
            </Badge>
          </CardTitle>
          <CardDescription>Overall market sentiment from social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Market Score</span>
              <span className="text-sm text-muted-foreground">
                {marketSentiment.overall.momentum}
              </span>
            </div>
            <Progress value={50 + marketSentiment.overall.score / 2} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Bearish</span>
              <span>Neutral</span>
              <span>Bullish</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Sector Sentiment</h4>
            {Object.entries(marketSentiment.sectors).map(([sector, data]) => (
              <div key={sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm capitalize">{sector}</span>
                  <span
                    className={`text-sm font-medium ${
                      data.sentiment > 0
                        ? 'text-green-500'
                        : data.sentiment < 0
                          ? 'text-red-500'
                          : 'text-gray-500'
                    }`}
                  >
                    {data.sentiment > 0 ? '+' : ''}
                    {data.sentiment.toFixed(1)}
                  </span>
                </div>
                <Progress value={50 + data.sentiment / 2} className="h-2" />
                <div className="flex gap-1">
                  {data.topStocks.map((stock) => (
                    <Badge key={stock} variant="outline" className="text-xs">
                      {stock}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Trending Topics</h4>
            <div className="space-y-2">
              {marketSentiment.trendingTopics.slice(0, 5).map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{topic.topic}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getSentimentColor(
                        topic.sentiment > 10
                          ? 'bullish'
                          : topic.sentiment < -10
                            ? 'bearish'
                            : 'neutral',
                      )}
                    >
                      {topic.sentiment > 0 ? '+' : ''}
                      {topic.sentiment.toFixed(0)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {(topic.volume / 1000).toFixed(1)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

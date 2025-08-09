'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { useSocialSentiment } from '@/hooks/useSocialSentiment';

interface SocialSentimentWidgetProps {
  symbols: string[];
  className?: string;
}

export function SocialSentimentWidget({ symbols, className }: SocialSentimentWidgetProps) {
  const { sentimentData, marketSentiment, alerts, loading } = useSocialSentiment(symbols);
  const [recentAlert, setRecentAlert] = useState<(typeof alerts)[0] | null>(null);

  useEffect(() => {
    if (alerts.length > 0) {
      setRecentAlert(alerts[0]);
      const timer = setTimeout(() => setRecentAlert(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Social Sentiment</CardTitle>
          <CardDescription>Loading sentiment analysis...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 20) return 'text-green-500';
    if (score < -20) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Social Sentiment</CardTitle>
            <CardDescription>Real-time market sentiment</CardDescription>
          </div>
          {marketSentiment && (
            <Badge variant="outline" className="flex items-center gap-1">
              {getSentimentIcon(marketSentiment.overall.sentiment)}
              <span className="capitalize">{marketSentiment.overall.sentiment}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAlert && (
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{recentAlert.message}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(recentAlert.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {marketSentiment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Market Score</span>
              <span
                className={`text-sm font-medium ${getSentimentColor(marketSentiment.overall.score)}`}
              >
                {marketSentiment.overall.score > 0 ? '+' : ''}
                {marketSentiment.overall.score.toFixed(1)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  marketSentiment.overall.score > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${50 + marketSentiment.overall.score / 2}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          {symbols.slice(0, 3).map((symbol) => {
            const data = sentimentData[symbol];
            if (!data) return null;

            return (
              <div key={symbol} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getSentimentColor(data.sentiment.score)}`}>
                      {data.sentiment.score > 0 ? '+' : ''}
                      {data.sentiment.score.toFixed(0)}
                    </span>
                    {getSentimentIcon(data.sentiment.current)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{data.metrics.tweetVolume.toLocaleString()} tweets</span>
                  <span>•</span>
                  <span>{data.sentiment.confidence.toFixed(0)}% confidence</span>
                </div>
              </div>
            );
          })}
        </div>

        {marketSentiment && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium mb-2">Top Sectors</div>
            <div className="space-y-1">
              {Object.entries(marketSentiment.sectors)
                .sort((a, b) => b[1].sentiment - a[1].sentiment)
                .slice(0, 3)
                .map(([sector, data]) => (
                  <div key={sector} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{sector}</span>
                    <span className={getSentimentColor(data.sentiment)}>
                      {data.sentiment > 0 ? '+' : ''}
                      {data.sentiment.toFixed(0)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

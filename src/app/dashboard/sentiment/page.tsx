'use client';

import { Search, TrendingUp, Brain, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { SocialSentiment } from '@/components/dashboard/social-sentiment';
import { SocialSentimentWidget } from '@/components/dashboard/social-sentiment-widget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSocialSentiment } from '@/hooks/useSocialSentiment';

export default function SentimentAnalysisPage() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [trackedSymbols, setTrackedSymbols] = useState(['AAPL', 'TSLA', 'NVDA']);
  const { sentimentData, marketSentiment, alerts, getSentimentSignal, getPortfolioAdjustments } =
    useSocialSentiment(trackedSymbols);

  const handleAddSymbol = () => {
    if (searchSymbol && !trackedSymbols.includes(searchSymbol.toUpperCase())) {
      setTrackedSymbols([...trackedSymbols, searchSymbol.toUpperCase()]);
      setSearchSymbol('');
    }
  };

  const handleRemoveSymbol = (symbol: string) => {
    setTrackedSymbols(trackedSymbols.filter((s) => s !== symbol));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Sentiment Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Real-time sentiment analysis from Twitter and social media
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="market" className="space-y-4">
            <TabsList>
              <TabsTrigger value="market">Market Overview</TabsTrigger>
              <TabsTrigger value="stocks">Individual Stocks</TabsTrigger>
              <TabsTrigger value="signals">AI Signals</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <SocialSentiment />

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Alerts</CardTitle>
                  <CardDescription>Recent significant sentiment changes</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No recent alerts</p>
                  ) : (
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                        >
                          <AlertCircle
                            className={`h-5 w-5 mt-0.5 ${
                              alert.severity === 'high'
                                ? 'text-red-500'
                                : alert.severity === 'medium'
                                  ? 'text-yellow-500'
                                  : 'text-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {alert.symbol && (
                                <Badge variant="outline" className="text-xs">
                                  {alert.symbol}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stocks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Track Stocks</CardTitle>
                  <CardDescription>Add stocks to monitor sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter stock symbol..."
                      value={searchSymbol}
                      onChange={(e) => setSearchSymbol(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <Button onClick={handleAddSymbol}>
                      <Search className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trackedSymbols.map((symbol) => (
                      <Badge
                        key={symbol}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveSymbol(symbol)}
                      >
                        {symbol} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {trackedSymbols.map((symbol) => (
                <SocialSentiment key={symbol} symbol={symbol} />
              ))}
            </TabsContent>

            <TabsContent value="signals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Trading Signals
                  </CardTitle>
                  <CardDescription>Sentiment-based trading recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trackedSymbols.map((symbol) => {
                    const signal = getSentimentSignal(symbol);
                    return (
                      <div key={symbol} className="p-4 rounded-lg border space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{symbol}</span>
                            <Badge
                              variant={
                                signal.signal === 'buy'
                                  ? 'default'
                                  : signal.signal === 'sell'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {signal.signal.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Confidence: {signal.strength.toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {sentimentData[symbol]?.sentiment.current || 'neutral'} sentiment
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {signal.reasoning.map((reason, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                              • {reason}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Adjustments</CardTitle>
                  <CardDescription>
                    Recommended weight adjustments based on sentiment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPortfolioAdjustments().map((adjustment) => (
                      <div
                        key={adjustment.symbol}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <span className="font-medium">{adjustment.symbol}</span>
                          <p className="text-sm text-muted-foreground">{adjustment.reason}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{adjustment.currentWeight.toFixed(1)}%</span>
                            <TrendingUp
                              className={`h-4 w-4 ${
                                adjustment.suggestedWeight > adjustment.currentWeight
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            />
                            <span className="text-sm font-medium">
                              {adjustment.suggestedWeight.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <SocialSentimentWidget symbols={trackedSymbols} />

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Data Collection</h4>
                <p className="text-muted-foreground">
                  Real-time analysis of tweets mentioning stocks, companies, and market trends
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Sentiment Analysis</h4>
                <p className="text-muted-foreground">
                  Natural language processing to determine bullish, bearish, or neutral sentiment
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Volume & Engagement</h4>
                <p className="text-muted-foreground">
                  Track tweet volume, engagement rates, and influencer activity
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">AI Integration</h4>
                <p className="text-muted-foreground">
                  Combine sentiment signals with technical analysis for trading recommendations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requests/15min</span>
                <span>180</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max results/request</span>
                <span>100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Update frequency</span>
                <span>1 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

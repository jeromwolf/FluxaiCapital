import { useState, useEffect, useCallback } from 'react';

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
}

interface SentimentAlert {
  id: string;
  type: 'sentiment_shift' | 'volume_spike' | 'influencer_alert';
  symbol?: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export function useSocialSentiment(symbols?: string[]) {
  const [sentimentData, setSentimentData] = useState<Record<string, SentimentData>>({});
  const [marketSentiment, setMarketSentiment] = useState<MarketSentimentData | null>(null);
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sentiment data for specific symbols
  const fetchSymbolSentiment = useCallback(async (symbol: string) => {
    try {
      const response = await fetch(`/api/v1/social/sentiment/${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch sentiment data');

      const data = await response.json();
      setSentimentData((prev) => ({ ...prev, [symbol]: data }));

      // Check for alerts
      checkForAlerts(data);
    } catch (err) {
      console.error(`Error fetching sentiment for ${symbol}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Fetch market-wide sentiment
  const fetchMarketSentiment = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/social/market-sentiment');
      if (!response.ok) throw new Error('Failed to fetch market sentiment');

      const data = await response.json();
      setMarketSentiment(data);
    } catch (err) {
      console.error('Error fetching market sentiment:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  // Check for sentiment alerts
  const checkForAlerts = useCallback((data: SentimentData) => {
    const newAlerts: SentimentAlert[] = [];

    // Check for extreme sentiment
    if (Math.abs(data.sentiment.score) > 70) {
      newAlerts.push({
        id: `${data.symbol}-extreme-${Date.now()}`,
        type: 'sentiment_shift',
        symbol: data.symbol,
        message: `Extreme ${data.sentiment.current} sentiment detected for ${data.symbol}`,
        severity: 'high',
        timestamp: new Date(),
      });
    }

    // Check for volume spikes
    const avgVolume =
      data.trends.hourly.reduce((sum, t) => sum + t.volume, 0) / data.trends.hourly.length;
    const latestVolume = data.trends.hourly[data.trends.hourly.length - 1]?.volume || 0;

    if (latestVolume > avgVolume * 2) {
      newAlerts.push({
        id: `${data.symbol}-volume-${Date.now()}`,
        type: 'volume_spike',
        symbol: data.symbol,
        message: `Unusual social media volume for ${data.symbol}`,
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    // Check for high influencer activity
    if (data.metrics.influencerActivity > 50) {
      newAlerts.push({
        id: `${data.symbol}-influencer-${Date.now()}`,
        type: 'influencer_alert',
        symbol: data.symbol,
        message: `High influencer activity detected for ${data.symbol}`,
        severity: 'medium',
        timestamp: new Date(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50)); // Keep last 50 alerts
    }
  }, []);

  // Get sentiment signal for trading strategy
  const getSentimentSignal = useCallback(
    (
      symbol: string,
    ): {
      signal: 'buy' | 'sell' | 'hold';
      strength: number;
      reasoning: string[];
    } => {
      const data = sentimentData[symbol];
      if (!data) {
        return { signal: 'hold', strength: 0, reasoning: ['No sentiment data available'] };
      }

      const reasoning: string[] = [];
      let buySignals = 0;
      let sellSignals = 0;

      // Analyze sentiment score
      if (data.sentiment.score > 50) {
        buySignals += 2;
        reasoning.push('Strong bullish sentiment');
      } else if (data.sentiment.score > 20) {
        buySignals += 1;
        reasoning.push('Moderate bullish sentiment');
      } else if (data.sentiment.score < -50) {
        sellSignals += 2;
        reasoning.push('Strong bearish sentiment');
      } else if (data.sentiment.score < -20) {
        sellSignals += 1;
        reasoning.push('Moderate bearish sentiment');
      }

      // Analyze volume trends
      const recentVolumes = data.trends.hourly.slice(-6).map((t) => t.volume);
      const volumeTrend = recentVolumes[recentVolumes.length - 1] - recentVolumes[0];

      if (volumeTrend > 0 && data.sentiment.score > 0) {
        buySignals += 1;
        reasoning.push('Increasing volume with positive sentiment');
      } else if (volumeTrend > 0 && data.sentiment.score < 0) {
        sellSignals += 1;
        reasoning.push('Increasing volume with negative sentiment');
      }

      // Analyze sentiment momentum
      const recentSentiments = data.trends.hourly.slice(-6).map((t) => t.sentiment);
      const sentimentTrend = recentSentiments[recentSentiments.length - 1] - recentSentiments[0];

      if (sentimentTrend > 10) {
        buySignals += 1;
        reasoning.push('Improving sentiment momentum');
      } else if (sentimentTrend < -10) {
        sellSignals += 1;
        reasoning.push('Deteriorating sentiment momentum');
      }

      // High confidence adds weight
      if (data.sentiment.confidence > 80) {
        if (buySignals > sellSignals) buySignals += 1;
        if (sellSignals > buySignals) sellSignals += 1;
        reasoning.push('High confidence in sentiment analysis');
      }

      // Determine signal
      let signal: 'buy' | 'sell' | 'hold';
      let strength: number;

      if (buySignals > sellSignals && buySignals >= 3) {
        signal = 'buy';
        strength = Math.min(buySignals / 5, 1) * 100;
      } else if (sellSignals > buySignals && sellSignals >= 3) {
        signal = 'sell';
        strength = Math.min(sellSignals / 5, 1) * 100;
      } else {
        signal = 'hold';
        strength = 50;
        reasoning.push('Mixed or neutral signals');
      }

      return { signal, strength, reasoning };
    },
    [sentimentData],
  );

  // Get sentiment-based portfolio adjustments
  const getPortfolioAdjustments = useCallback((): Array<{
    symbol: string;
    currentWeight: number;
    suggestedWeight: number;
    reason: string;
  }> => {
    if (!marketSentiment || Object.keys(sentimentData).length === 0) {
      return [];
    }

    const adjustments: Array<{
      symbol: string;
      currentWeight: number;
      suggestedWeight: number;
      reason: string;
    }> = [];

    // Analyze each symbol
    for (const [symbol, data] of Object.entries(sentimentData)) {
      const signal = getSentimentSignal(symbol);
      const currentWeight = 100 / Object.keys(sentimentData).length; // Assume equal weight

      let suggestedWeight = currentWeight;
      let reason = '';

      if (signal.signal === 'buy' && signal.strength > 70) {
        suggestedWeight = currentWeight * 1.2;
        reason = 'Strong positive sentiment - increase allocation';
      } else if (signal.signal === 'sell' && signal.strength > 70) {
        suggestedWeight = currentWeight * 0.8;
        reason = 'Strong negative sentiment - reduce allocation';
      }

      // Sector-based adjustments
      const sector = getSectorForSymbol(symbol);
      if (sector && marketSentiment.sectors[sector]) {
        const sectorSentiment = marketSentiment.sectors[sector].sentiment;
        if (sectorSentiment > 30) {
          suggestedWeight *= 1.1;
          reason += '; Positive sector sentiment';
        } else if (sectorSentiment < -30) {
          suggestedWeight *= 0.9;
          reason += '; Negative sector sentiment';
        }
      }

      if (suggestedWeight !== currentWeight) {
        adjustments.push({
          symbol,
          currentWeight,
          suggestedWeight,
          reason: reason.trim(),
        });
      }
    }

    return adjustments;
  }, [sentimentData, marketSentiment, getSentimentSignal]);

  // Helper function to map symbols to sectors
  const getSectorForSymbol = (symbol: string): string | null => {
    const sectorMap: Record<string, string> = {
      AAPL: 'tech',
      MSFT: 'tech',
      GOOGL: 'tech',
      META: 'tech',
      NVDA: 'tech',
      JPM: 'finance',
      BAC: 'finance',
      GS: 'finance',
      MS: 'finance',
      WFC: 'finance',
      XOM: 'energy',
      CVX: 'energy',
      COP: 'energy',
      SLB: 'energy',
      EOG: 'energy',
      JNJ: 'healthcare',
      UNH: 'healthcare',
      PFE: 'healthcare',
      ABBV: 'healthcare',
      TMO: 'healthcare',
      AMZN: 'consumer',
      TSLA: 'consumer',
      WMT: 'consumer',
      HD: 'consumer',
      MCD: 'consumer',
    };
    return sectorMap[symbol] || null;
  };

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch market sentiment
        await fetchMarketSentiment();

        // Fetch individual symbol sentiment
        if (symbols && symbols.length > 0) {
          await Promise.all(symbols.map((symbol) => fetchSymbolSentiment(symbol)));
        }
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    // Set up refresh interval
    const interval = setInterval(fetchAllData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [symbols, fetchMarketSentiment, fetchSymbolSentiment]);

  return {
    sentimentData,
    marketSentiment,
    alerts,
    loading,
    error,
    getSentimentSignal,
    getPortfolioAdjustments,
    clearAlerts,
    refetch: useCallback(async () => {
      setLoading(true);
      await fetchMarketSentiment();
      if (symbols) {
        await Promise.all(symbols.map((symbol) => fetchSymbolSentiment(symbol)));
      }
      setLoading(false);
    }, [symbols, fetchMarketSentiment, fetchSymbolSentiment]),
  };
}

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { MarketPrice, MarketTicker } from '@/lib/market/types';
import { getMarketDataClient } from '@/lib/market/client';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data.data;
};

// Hook for fetching market prices
export function useMarketPrices(symbols: string[], refreshInterval = 30000) {
  const symbolsQuery = symbols.join(',');

  const { data, error, isLoading, mutate } = useSWR<MarketPrice[]>(
    symbols.length > 0 ? `/api/v1/market/prices?symbols=${symbolsQuery}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
    },
  );

  return {
    prices: data || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook for fetching single market price
export function useMarketPrice(symbol: string | null, refreshInterval = 30000) {
  const { data, error, isLoading, mutate } = useSWR<MarketPrice>(
    symbol ? `/api/v1/market/prices/${symbol}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
    },
  );

  return {
    price: data,
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook for real-time price updates via WebSocket
export function useRealtimePrice(symbol: string | null) {
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!symbol) return;

    const marketClient = getMarketDataClient();

    const handleTicker = (data: MarketTicker) => {
      setTicker(data);
      setIsConnected(true);
    };

    const unsubscribe = marketClient.subscribeToPrice(symbol, handleTicker);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [symbol]);

  return {
    ticker,
    isConnected,
  };
}

// Hook for candle data
export function useMarketCandles(
  symbol: string | null,
  interval: '1m' | '5m' | '1h' | '1d' = '1h',
  count: number = 100,
) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? `/api/v1/market/candles/${symbol}?interval=${interval}&count=${count}` : null,
    fetcher,
    {
      refreshInterval: interval === '1m' ? 60000 : interval === '5m' ? 300000 : 3600000,
      revalidateOnFocus: false,
    },
  );

  return {
    candles: data?.candles || [],
    error,
    isLoading,
    refresh: mutate,
  };
}

// Hook to update holdings with current prices
export function useHoldingsWithPrices(holdings: any[], refreshInterval = 30000) {
  const symbols = holdings.map((h) => h.symbol);
  const { prices, isLoading } = useMarketPrices(symbols, refreshInterval);

  const holdingsWithCurrentPrices = holdings.map((holding) => {
    const currentPrice = prices.find((p) => p.symbol === holding.symbol);

    if (currentPrice) {
      const marketValue = holding.quantity * currentPrice.price;
      const unrealizedPnL = marketValue - holding.quantity * holding.averagePrice;
      const unrealizedPnLPercent =
        (unrealizedPnL / (holding.quantity * holding.averagePrice)) * 100;

      return {
        ...holding,
        currentPrice: currentPrice.price,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        change24h: currentPrice.changePercent,
        lastUpdated: currentPrice.updatedAt,
      };
    }

    return holding;
  });

  return {
    holdings: holdingsWithCurrentPrices,
    isLoading,
  };
}

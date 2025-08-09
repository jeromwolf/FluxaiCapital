import { useState, useEffect, useCallback } from 'react';
import { marketData, MarketQuote } from '@/lib/market-data';
import { useToast } from '@/components/ui/use-toast';

interface UseRealtimeQuotesOptions {
  symbols: string[];
  interval?: number;
  enabled?: boolean;
}

export function useRealtimeQuotes({
  symbols,
  interval = 5000,
  enabled = true,
}: UseRealtimeQuotesOptions) {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchQuotes = useCallback(async () => {
    try {
      const data = await marketData.getMultipleQuotes(symbols);
      setQuotes(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error fetching quotes',
        description: 'Failed to fetch real-time market data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [symbols, toast]);

  useEffect(() => {
    if (!enabled || symbols.length === 0) return;

    // Initial fetch
    fetchQuotes();

    // Subscribe to real-time updates
    const unsubscribe = marketData.subscribeToQuotes(symbols, (newQuotes) => {
      setQuotes(newQuotes);
    });

    return () => {
      unsubscribe();
    };
  }, [symbols, enabled, fetchQuotes]);

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
  };
}

// Hook for single stock quote
export function useRealtimeQuote(symbol: string, enabled = true) {
  const { quotes, loading, error, refetch } = useRealtimeQuotes({
    symbols: symbol ? [symbol] : [],
    enabled,
  });

  return {
    quote: quotes[0] || null,
    loading,
    error,
    refetch,
  };
}

// Hook for market overview
export function useMarketOverview(enabled = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchOverview = async () => {
      try {
        const overview = await marketData.getMarketOverview();
        setData(overview);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
    const interval = setInterval(fetchOverview, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  return { data, loading, error };
}
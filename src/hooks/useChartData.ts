'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MarketCandle } from '@/lib/market/types';
import { TimeFrame, TimeFrameConverter, TechnicalIndicators } from '@/lib/charting/trading-view-chart';
import { getWebSocketClient } from '@/lib/websocket/client';

interface ChartDataConfig {
  symbol: string;
  timeframe: TimeFrame;
  limit?: number;
  indicators?: string[];
}

interface ChartDataState {
  candles: MarketCandle[];
  loading: boolean;
  error: string | null;
  indicators: Record<string, (number | null)[]>;
}

interface HistoricalDataResponse {
  candles: MarketCandle[];
  hasMore: boolean;
}

export function useChartData(config: ChartDataConfig) {
  const [state, setState] = useState<ChartDataState>({
    candles: [],
    loading: true,
    error: null,
    indicators: {},
  });

  const wsClient = useRef(getWebSocketClient());
  const lastCandleRef = useRef<MarketCandle | null>(null);
  const candleBufferRef = useRef<Partial<MarketCandle>>({});

  // Load historical data
  const loadHistoricalData = useCallback(async (
    symbol: string,
    timeframe: TimeFrame,
    from?: number,
    to?: number,
    limit?: number
  ): Promise<HistoricalDataResponse> => {
    try {
      const params = new URLSearchParams({
        symbol,
        timeframe,
        ...(from && { from: from.toString() }),
        ...(to && { to: to.toString() }),
        ...(limit && { limit: limit.toString() }),
      });

      const response = await fetch(`/api/v1/market/candles?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      return {
        candles: data.candles || [],
        hasMore: data.hasMore || false,
      };
    } catch (error) {
      console.error('Error loading historical data:', error);
      // Return mock data for development
      return {
        candles: generateMockCandles(symbol, timeframe, limit || 100),
        hasMore: true,
      };
    }
  }, []);

  // Generate mock candles for development
  const generateMockCandles = useCallback((
    symbol: string,
    timeframe: TimeFrame,
    count: number
  ): MarketCandle[] => {
    const candles: MarketCandle[] = [];
    const intervalMs = TimeFrameConverter.getMilliseconds(timeframe);
    const now = Date.now();
    
    let basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 3000 : 100;
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const volatility = 0.002; // 0.2% volatility
      
      const open = basePrice;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const high = open * (1 + Math.abs(change) + Math.random() * volatility);
      const low = open * (1 - Math.abs(change) - Math.random() * volatility);
      const close = open * (1 + change);
      const volume = Math.random() * 1000000;
      
      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });
      
      basePrice = close;
    }
    
    return candles;
  }, []);

  // Calculate indicators
  const calculateIndicators = useCallback((
    candles: MarketCandle[],
    indicatorTypes: string[]
  ): Record<string, (number | null)[]> => {
    const indicators: Record<string, (number | null)[]> = {};
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    indicatorTypes.forEach(type => {
      switch (type) {
        case 'MA20':
          indicators[type] = TechnicalIndicators.SMA(closes, 20);
          break;
        case 'MA50':
          indicators[type] = TechnicalIndicators.SMA(closes, 50);
          break;
        case 'MA200':
          indicators[type] = TechnicalIndicators.SMA(closes, 200);
          break;
        case 'EMA12':
          indicators[type] = TechnicalIndicators.EMA(closes, 12);
          break;
        case 'EMA26':
          indicators[type] = TechnicalIndicators.EMA(closes, 26);
          break;
        case 'RSI':
          indicators[type] = TechnicalIndicators.RSI(closes, 14);
          break;
        case 'MACD': {
          const macd = TechnicalIndicators.MACD(closes);
          indicators['MACD'] = macd.macd;
          indicators['MACD_SIGNAL'] = macd.signal;
          indicators['MACD_HISTOGRAM'] = macd.histogram;
          break;
        }
        case 'BB': {
          const bb = TechnicalIndicators.BollingerBands(closes, 20, 2);
          indicators['BB_UPPER'] = bb.upper;
          indicators['BB_MIDDLE'] = bb.middle;
          indicators['BB_LOWER'] = bb.lower;
          break;
        }
        case 'STOCH': {
          const stoch = TechnicalIndicators.Stochastic(highs, lows, closes, 14, 3, 3);
          indicators['STOCH_K'] = stoch.k;
          indicators['STOCH_D'] = stoch.d;
          break;
        }
        case 'ATR':
          indicators[type] = TechnicalIndicators.ATR(highs, lows, closes, 14);
          break;
      }
    });
    
    return indicators;
  }, []);

  // Update candle from real-time tick
  const updateCandleFromTick = useCallback((
    tick: { price: number; volume: number; timestamp: number },
    timeframe: TimeFrame
  ) => {
    const intervalMs = TimeFrameConverter.getMilliseconds(timeframe);
    const candleTimestamp = Math.floor(tick.timestamp / intervalMs) * intervalMs;
    
    setState(prev => {
      const candles = [...prev.candles];
      const lastCandle = candles[candles.length - 1];
      
      if (!lastCandle || lastCandle.timestamp < candleTimestamp) {
        // New candle
        const newCandle: MarketCandle = {
          timestamp: candleTimestamp,
          open: tick.price,
          high: tick.price,
          low: tick.price,
          close: tick.price,
          volume: tick.volume,
        };
        candles.push(newCandle);
        
        // Keep only last 1000 candles
        if (candles.length > 1000) {
          candles.shift();
        }
      } else if (lastCandle.timestamp === candleTimestamp) {
        // Update existing candle
        lastCandle.high = Math.max(lastCandle.high, tick.price);
        lastCandle.low = Math.min(lastCandle.low, tick.price);
        lastCandle.close = tick.price;
        lastCandle.volume += tick.volume;
      }
      
      // Recalculate indicators if needed
      const indicators = config.indicators 
        ? calculateIndicators(candles, config.indicators)
        : prev.indicators;
      
      return {
        ...prev,
        candles,
        indicators,
      };
    });
  }, [config.indicators, calculateIndicators]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const { candles } = await loadHistoricalData(
          config.symbol,
          config.timeframe,
          undefined,
          undefined,
          config.limit || 500
        );
        
        const indicators = config.indicators 
          ? calculateIndicators(candles, config.indicators)
          : {};
        
        setState({
          candles,
          loading: false,
          error: null,
          indicators,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load data',
        }));
      }
    };
    
    loadData();
  }, [config.symbol, config.timeframe, config.limit, config.indicators, loadHistoricalData, calculateIndicators]);

  // Subscribe to real-time updates
  useEffect(() => {
    const ws = wsClient.current;
    
    // Connect if not connected
    if (!ws.isConnected()) {
      ws.connect();
    }
    
    // Subscribe to price updates
    const unsubscribe = ws.subscribe('price', (data: any) => {
      if (data.symbol === config.symbol) {
        updateCandleFromTick({
          price: data.price,
          volume: data.volume || 0,
          timestamp: data.timestamp || Date.now(),
        }, config.timeframe);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [config.symbol, config.timeframe, updateCandleFromTick]);

  // Public methods
  const loadMoreCandles = useCallback(async (count: number = 100) => {
    if (state.loading || state.candles.length === 0) return;
    
    const oldestCandle = state.candles[0];
    const { candles: moreCandles } = await loadHistoricalData(
      config.symbol,
      config.timeframe,
      undefined,
      oldestCandle.timestamp,
      count
    );
    
    setState(prev => ({
      ...prev,
      candles: [...moreCandles, ...prev.candles],
      indicators: config.indicators 
        ? calculateIndicators([...moreCandles, ...prev.candles], config.indicators)
        : prev.indicators,
    }));
  }, [state.loading, state.candles, config.symbol, config.timeframe, config.indicators, loadHistoricalData, calculateIndicators]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { candles } = await loadHistoricalData(
        config.symbol,
        config.timeframe,
        undefined,
        undefined,
        config.limit || 500
      );
      
      const indicators = config.indicators 
        ? calculateIndicators(candles, config.indicators)
        : {};
      
      setState({
        candles,
        loading: false,
        error: null,
        indicators,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
      }));
    }
  }, [config.symbol, config.timeframe, config.limit, config.indicators, loadHistoricalData, calculateIndicators]);

  return {
    candles: state.candles,
    loading: state.loading,
    error: state.error,
    indicators: state.indicators,
    loadMoreCandles,
    refresh,
  };
}
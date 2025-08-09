// Mock market data provider for development

import { MarketPrice, MarketTicker, MarketCandle } from '../types';

// Mock stock data
const MOCK_STOCKS = {
  // US Stocks
  AAPL: { name: 'Apple Inc.', basePrice: 175, currency: 'USD' },
  MSFT: { name: 'Microsoft Corp.', basePrice: 380, currency: 'USD' },
  GOOGL: { name: 'Alphabet Inc.', basePrice: 140, currency: 'USD' },
  AMZN: { name: 'Amazon.com Inc.', basePrice: 170, currency: 'USD' },
  NVDA: { name: 'NVIDIA Corp.', basePrice: 750, currency: 'USD' },
  TSLA: { name: 'Tesla Inc.', basePrice: 250, currency: 'USD' },
  META: { name: 'Meta Platforms', basePrice: 480, currency: 'USD' },

  // Korean Stocks
  '005930': { name: '삼성전자', basePrice: 72000, currency: 'KRW' },
  '000660': { name: 'SK하이닉스', basePrice: 135000, currency: 'KRW' },
  '035420': { name: 'NAVER', basePrice: 210000, currency: 'KRW' },
  '035720': { name: '카카오', basePrice: 52000, currency: 'KRW' },
  '005380': { name: '현대차', basePrice: 240000, currency: 'KRW' },
  '051910': { name: 'LG화학', basePrice: 480000, currency: 'KRW' },
  '006400': { name: '삼성SDI', basePrice: 450000, currency: 'KRW' },
};

// Price cache to maintain consistency
const priceCache = new Map<string, number>();

// Generate realistic price movement
function generatePrice(symbol: string): number {
  const stock = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS];
  if (!stock) return 0;

  const cachedPrice = priceCache.get(symbol);
  const basePrice = cachedPrice || stock.basePrice;

  // Random walk with mean reversion
  const volatility = 0.02; // 2% volatility
  const meanReversion = 0.1; // 10% mean reversion strength
  const change = (Math.random() - 0.5) * volatility;
  const reversion = ((stock.basePrice - basePrice) / stock.basePrice) * meanReversion;

  const newPrice = basePrice * (1 + change + reversion);
  priceCache.set(symbol, newPrice);

  return Number(newPrice.toFixed(2));
}

// Generate market data
export function generateMarketPrice(symbol: string): MarketPrice | null {
  const stock = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS];
  if (!stock) return null;

  const price = generatePrice(symbol);
  const previousPrice = stock.basePrice;
  const change = price - previousPrice;
  const changePercent = (change / previousPrice) * 100;

  // Generate realistic volume based on market cap
  const baseVolume = stock.currency === 'KRW' ? 1000000 : 10000;
  const volume = Math.floor(baseVolume * (0.5 + Math.random()));

  return {
    symbol,
    name: stock.name,
    price,
    currency: stock.currency,
    change,
    changePercent,
    volume,
    high24h: price * 1.02,
    low24h: price * 0.98,
    updatedAt: new Date(),
  };
}

// Generate ticker data
export function generateMarketTicker(symbol: string): MarketTicker | null {
  const marketPrice = generateMarketPrice(symbol);
  if (!marketPrice) return null;

  return {
    symbol: marketPrice.symbol,
    price: marketPrice.price,
    change: marketPrice.change,
    changePercent: marketPrice.changePercent,
    volume: marketPrice.volume,
    timestamp: Date.now(),
  };
}

// Generate candle data
export function generateMarketCandles(
  symbol: string,
  interval: '1m' | '5m' | '1h' | '1d',
  count: number,
): MarketCandle[] {
  const candles: MarketCandle[] = [];
  const stock = MOCK_STOCKS[symbol as keyof typeof MOCK_STOCKS];
  if (!stock) return candles;

  const intervalMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  }[interval];

  let currentPrice = stock.basePrice;
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMs;
    const volatility = 0.01;

    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * 2;
    const high = open * (1 + Math.abs(change) + Math.random() * volatility);
    const low = open * (1 - Math.abs(change) - Math.random() * volatility);
    const close = open * (1 + change);

    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.floor(10000 + Math.random() * 90000),
    });

    currentPrice = close;
  }

  return candles;
}

// Get all available symbols
export function getAvailableSymbols(): string[] {
  return Object.keys(MOCK_STOCKS);
}

// WebSocket-like event emitter for real-time updates
export class MockMarketWebSocket {
  private subscribers = new Map<string, Set<(data: MarketTicker) => void>>();
  private intervals = new Map<string, NodeJS.Timeout>();

  subscribe(symbol: string, callback: (data: MarketTicker) => void) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());

      // Start generating updates for this symbol
      const interval = setInterval(
        () => {
          const ticker = generateMarketTicker(symbol);
          if (ticker) {
            const callbacks = this.subscribers.get(symbol);
            callbacks?.forEach((cb) => cb(ticker));
          }
        },
        1000 + Math.random() * 2000,
      ); // Update every 1-3 seconds

      this.intervals.set(symbol, interval);
    }

    this.subscribers.get(symbol)?.add(callback);

    // Send initial data
    const ticker = generateMarketTicker(symbol);
    if (ticker) callback(ticker);
  }

  unsubscribe(symbol: string, callback: (data: MarketTicker) => void) {
    const callbacks = this.subscribers.get(symbol);
    callbacks?.delete(callback);

    if (callbacks?.size === 0) {
      const interval = this.intervals.get(symbol);
      if (interval) clearInterval(interval as NodeJS.Timeout);
      this.intervals.delete(symbol);
      this.subscribers.delete(symbol);
    }
  }

  close() {
    this.intervals.forEach((interval) => clearInterval(interval as NodeJS.Timeout));
    this.intervals.clear();
    this.subscribers.clear();
  }
}

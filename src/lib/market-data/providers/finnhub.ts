// Finnhub API Provider for real-time market data
import { MarketQuote } from '../types';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface FinnhubQuote {
  c: number; // Current price
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  name: string;
  ticker: string;
  marketCapitalization: number;
  shareOutstanding: number;
}

export class FinnhubProvider {
  private apiKey: string;
  private websocket: WebSocket | null = null;
  
  constructor() {
    this.apiKey = FINNHUB_API_KEY;
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    try {
      // Get quote data
      const quoteResponse = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${this.apiKey}`
      );
      
      if (!quoteResponse.ok) {
        throw new Error(`Failed to fetch quote for ${symbol}`);
      }
      
      const quote: FinnhubQuote = await quoteResponse.json();
      
      // Get company profile for additional info
      const profileResponse = await fetch(
        `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`
      );
      
      const profile: FinnhubProfile = profileResponse.ok 
        ? await profileResponse.json() 
        : { name: symbol, marketCapitalization: 0 };

      const change = quote.c - quote.pc;
      const changePercent = (change / quote.pc) * 100;

      return {
        symbol,
        name: profile.name || symbol,
        price: quote.c,
        currency: 'USD',
        previousClose: quote.pc,
        change,
        changePercent,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        marketCap: profile.marketCapitalization * 1000000, // Convert from millions
        dayHigh: quote.h,
        dayLow: quote.l,
        timestamp: new Date(quote.t * 1000),
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const quotes = await Promise.allSettled(
      symbols.map(symbol => this.getQuote(symbol))
    );

    return quotes
      .filter((result): result is PromiseFulfilledResult<MarketQuote> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  async getCandles(
    symbol: string,
    resolution: 'D' | 'W' | 'M' | '1' | '5' | '15' | '30' | '60',
    from: number,
    to: number
  ) {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch candles for ${symbol}`);
    }

    const data = await response.json();
    
    if (data.s !== 'ok') {
      return [];
    }

    return data.c.map((close: number, index: number) => ({
      timestamp: new Date(data.t[index] * 1000),
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: close,
      volume: data.v[index],
    }));
  }

  // Real-time WebSocket connection
  connectWebSocket(symbols: string[], onMessage: (data: any) => void): () => void {
    if (!process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET) {
      // Return dummy unsubscribe function if WebSocket is disabled
      return () => {};
    }

    this.websocket = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);
    
    this.websocket.addEventListener('open', () => {
      // Subscribe to symbols
      symbols.forEach(symbol => {
        this.websocket?.send(JSON.stringify({
          type: 'subscribe',
          symbol: symbol
        }));
      });
    });

    this.websocket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'trade') {
        onMessage(message.data);
      }
    });

    this.websocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Return unsubscribe function
    return () => {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        symbols.forEach(symbol => {
          this.websocket?.send(JSON.stringify({
            type: 'unsubscribe',
            symbol: symbol
          }));
        });
        this.websocket.close();
      }
    };
  }

  async getMarketNews(category: 'general' | 'forex' | 'crypto' | 'merger' = 'general') {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/news?category=${category}&token=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch market news');
    }

    const news = await response.json();
    
    return news.slice(0, 10).map((item: any) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      image: item.image,
      datetime: new Date(item.datetime * 1000),
      category: item.category,
    }));
  }

  async getMarketStatus() {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/market-status?exchange=US&token=${this.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch market status');
    }

    return response.json();
  }

  async getEarningsCalendar(from: string, to: string, symbol?: string) {
    let url = `${FINNHUB_BASE_URL}/calendar/earnings?from=${from}&to=${to}&token=${this.apiKey}`;
    if (symbol) {
      url += `&symbol=${symbol}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch earnings calendar');
    }

    return response.json();
  }
}

export const finnhub = new FinnhubProvider();
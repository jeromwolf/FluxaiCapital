// Twelve Data API Provider for Korean stocks
import { MarketQuote } from '../types';

const TWELVE_DATA_API_KEY = process.env.TWELVE_DATA_API_KEY!;
const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';

interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  is_market_open: boolean;
}

interface TwelveDataTimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
}

export class TwelveDataProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = TWELVE_DATA_API_KEY;
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    try {
      const response = await fetch(
        `${TWELVE_DATA_BASE_URL}/quote?symbol=${symbol}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch quote for ${symbol}`);
      }

      const data: TwelveDataQuote = await response.json();

      return {
        symbol: data.symbol,
        name: data.name,
        price: parseFloat(data.close),
        currency: data.currency,
        previousClose: parseFloat(data.previous_close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseInt(data.volume),
        marketCap: 0, // Not provided by Twelve Data quote endpoint
        dayHigh: parseFloat(data.high),
        dayLow: parseFloat(data.low),
        timestamp: new Date(data.timestamp * 1000),
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getKoreanStockQuote(symbol: string): Promise<MarketQuote> {
    // Korean stocks need exchange suffix
    const koreanSymbol = symbol.includes(':') ? symbol : `${symbol}:KOSPI`;
    return this.getQuote(koreanSymbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketQuote[]> {
    try {
      const symbolsStr = symbols.join(',');
      const response = await fetch(
        `${TWELVE_DATA_BASE_URL}/quote?symbol=${symbolsStr}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch multiple quotes');
      }

      const data = await response.json();
      
      // Handle both single quote and multiple quotes response
      const quotes = Array.isArray(data) ? data : [data];
      
      return quotes.map((quote: TwelveDataQuote) => ({
        symbol: quote.symbol,
        name: quote.name,
        price: parseFloat(quote.close),
        currency: quote.currency,
        previousClose: parseFloat(quote.previous_close),
        change: parseFloat(quote.change),
        changePercent: parseFloat(quote.percent_change),
        volume: parseInt(quote.volume),
        marketCap: 0,
        dayHigh: parseFloat(quote.high),
        dayLow: parseFloat(quote.low),
        timestamp: new Date(quote.timestamp * 1000),
      }));
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  }

  async getTimeSeries(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '1h' | '1day' | '1week' | '1month' = '1day',
    outputSize: number = 30
  ) {
    try {
      const response = await fetch(
        `${TWELVE_DATA_BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputSize}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch time series for ${symbol}`);
      }

      const data: TwelveDataTimeSeries = await response.json();

      return data.values.map(value => ({
        timestamp: new Date(value.datetime),
        open: parseFloat(value.open),
        high: parseFloat(value.high),
        low: parseFloat(value.low),
        close: parseFloat(value.close),
        volume: parseInt(value.volume),
      }));
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      throw error;
    }
  }

  async getTechnicalIndicator(
    symbol: string,
    indicator: 'sma' | 'ema' | 'rsi' | 'macd' | 'bbands' | 'stoch',
    interval: string = '1day',
    timePeriod?: number
  ) {
    let url = `${TWELVE_DATA_BASE_URL}/${indicator}?symbol=${symbol}&interval=${interval}&apikey=${this.apiKey}`;
    
    if (timePeriod) {
      url += `&time_period=${timePeriod}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${indicator} for ${symbol}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Error fetching ${indicator} for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarketMovers(outputSize: number = 10) {
    try {
      const response = await fetch(
        `${TWELVE_DATA_BASE_URL}/market_movers?outputsize=${outputSize}&apikey=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market movers');
      }

      const data = await response.json();
      
      return {
        gainers: data.gainers || [],
        losers: data.losers || [],
        volume: data.volume || [],
      };
    } catch (error) {
      console.error('Error fetching market movers:', error);
      throw error;
    }
  }

  async searchSymbols(keywords: string, exchange?: string) {
    let url = `${TWELVE_DATA_BASE_URL}/symbol_search?symbol=${keywords}&apikey=${this.apiKey}`;
    
    if (exchange) {
      url += `&exchange=${exchange}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to search symbols');
      }

      const data = await response.json();
      
      return data.data || [];
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  // WebSocket connection for real-time data
  connectWebSocket(symbols: string[], onMessage: (data: any) => void): () => void {
    const ws = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${this.apiKey}`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        params: {
          symbols: symbols.join(',')
        }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'price') {
        onMessage(data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return unsubscribe function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: 'unsubscribe',
          params: {
            symbols: symbols.join(',')
          }
        }));
        ws.close();
      }
    };
  }
}

export const twelveData = new TwelveDataProvider();
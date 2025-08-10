// Alpha Vantage API Provider
import { MarketQuote } from '../types';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageGlobalQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageSearchResult {
  bestMatches: Array<{
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }>;
}

export class AlphaVantageProvider {
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache

  constructor() {
    this.apiKey = ALPHA_VANTAGE_API_KEY;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getQuote(symbol: string): Promise<MarketQuote> {
    const cacheKey = `quote:${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch quote for ${symbol}`);
      }

      const data: AlphaVantageGlobalQuote = await response.json();

      if (!data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
        throw new Error(`No data found for symbol ${symbol}`);
      }

      const quote = data['Global Quote'];
      const price = parseFloat(quote['05. price']);
      const previousClose = parseFloat(quote['08. previous close']);
      const change = parseFloat(quote['09. change']);
      const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

      const marketQuote: MarketQuote = {
        symbol,
        name: symbol, // Alpha Vantage doesn't provide name in quote endpoint
        price,
        currency: 'USD',
        previousClose,
        change,
        changePercent,
        volume: parseInt(quote['06. volume']),
        marketCap: 0, // Not provided by Alpha Vantage
        dayHigh: parseFloat(quote['03. high']),
        dayLow: parseFloat(quote['04. low']),
        timestamp: new Date(),
      };

      this.setCachedData(cacheKey, marketQuote);
      return marketQuote;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  async searchSymbols(keywords: string): Promise<
    Array<{
      symbol: string;
      name: string;
      type: string;
      region: string;
      currency: string;
    }>
  > {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error('Failed to search symbols');
      }

      const data: AlphaVantageSearchResult = await response.json();

      return data.bestMatches.map((match) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        currency: match['8. currency'],
      }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  async getTimeSeries(
    symbol: string,
    interval:
      | '1min'
      | '5min'
      | '15min'
      | '30min'
      | '60min'
      | 'daily'
      | 'weekly'
      | 'monthly' = 'daily',
    outputSize: 'compact' | 'full' = 'compact',
  ) {
    const functionMap = {
      '1min': 'TIME_SERIES_INTRADAY',
      '5min': 'TIME_SERIES_INTRADAY',
      '15min': 'TIME_SERIES_INTRADAY',
      '30min': 'TIME_SERIES_INTRADAY',
      '60min': 'TIME_SERIES_INTRADAY',
      daily: 'TIME_SERIES_DAILY',
      weekly: 'TIME_SERIES_WEEKLY',
      monthly: 'TIME_SERIES_MONTHLY',
    };

    const func = functionMap[interval];
    let url = `${ALPHA_VANTAGE_BASE_URL}?function=${func}&symbol=${symbol}&apikey=${this.apiKey}&outputsize=${outputSize}`;

    if (interval.includes('min')) {
      url += `&interval=${interval}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch time series for ${symbol}`);
      }

      const data = await response.json();

      // Extract time series data based on the function used
      const timeSeriesKey = Object.keys(data).find((key) => key.includes('Time Series'));
      if (!timeSeriesKey) {
        throw new Error('No time series data found');
      }

      const timeSeries = data[timeSeriesKey];

      return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => ({
        timestamp: new Date(timestamp),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }));
    } catch (error) {
      console.error(`Error fetching time series for ${symbol}:`, error);
      throw error;
    }
  }

  async getTechnicalIndicator(
    symbol: string,
    indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'STOCH' | 'BBANDS',
    interval:
      | '1min'
      | '5min'
      | '15min'
      | '30min'
      | '60min'
      | 'daily'
      | 'weekly'
      | 'monthly' = 'daily',
    timePeriod: number = 20,
    seriesType: 'close' | 'open' | 'high' | 'low' = 'close',
  ) {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=${indicator}&symbol=${symbol}&interval=${interval}&time_period=${timePeriod}&series_type=${seriesType}&apikey=${this.apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${indicator} for ${symbol}`);
      }

      const data = await response.json();

      // Extract technical analysis data
      const taKey = Object.keys(data).find((key) => key.includes('Technical Analysis'));
      if (!taKey) {
        throw new Error('No technical analysis data found');
      }

      return data[taKey];
    } catch (error) {
      console.error(`Error fetching ${indicator} for ${symbol}:`, error);
      throw error;
    }
  }

  async getSectorPerformance() {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=SECTOR&apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sector performance');
      }

      const data = await response.json();

      return {
        realTimePerformance: data['Rank A: Real-Time Performance'],
        oneDay: data['Rank B: 1 Day Performance'],
        fiveDay: data['Rank C: 5 Day Performance'],
        oneMonth: data['Rank D: 1 Month Performance'],
        threeMonth: data['Rank E: 3 Month Performance'],
        yearToDate: data['Rank F: Year-to-Date (YTD) Performance'],
        oneYear: data['Rank G: 1 Year Performance'],
        threeYear: data['Rank H: 3 Year Performance'],
        fiveYear: data['Rank I: 5 Year Performance'],
        tenYear: data['Rank J: 10 Year Performance'],
      };
    } catch (error) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  }
}

export const alphaVantage = new AlphaVantageProvider();

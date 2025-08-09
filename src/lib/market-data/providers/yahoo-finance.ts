// Yahoo Finance API Provider
// Note: In production, you should use an official API with proper authentication

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  timestamp: Date;
}

interface HistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export class YahooFinanceProvider {
  private baseUrl = 'https://query1.finance.yahoo.com/v8/finance';

  // Mock data for development
  private mockQuotes: Record<string, Partial<StockQuote>> = {
    AAPL: { name: 'Apple Inc.', price: 182.52, previousClose: 181.18, marketCap: 2.89e12 },
    MSFT: {
      name: 'Microsoft Corporation',
      price: 430.16,
      previousClose: 428.74,
      marketCap: 3.2e12,
    },
    GOOGL: { name: 'Alphabet Inc.', price: 142.57, previousClose: 141.8, marketCap: 1.77e12 },
    NVDA: { name: 'NVIDIA Corporation', price: 878.37, previousClose: 875.28, marketCap: 2.17e12 },
    TSLA: { name: 'Tesla, Inc.', price: 238.45, previousClose: 235.6, marketCap: 759e9 },
    '005930.KS': {
      name: 'Samsung Electronics',
      price: 71800,
      previousClose: 71200,
      marketCap: 428e12,
    },
    '035420.KS': {
      name: 'NAVER Corporation',
      price: 223500,
      previousClose: 221000,
      marketCap: 36.6e12,
    },
  };

  async getQuote(symbol: string): Promise<StockQuote> {
    // In development, return mock data with random variations
    if (process.env.NODE_ENV === 'development') {
      return this.getMockQuote(symbol);
    }

    // In production, you would call the actual API
    // const response = await fetch(`${this.baseUrl}/quote?symbols=${symbol}`);
    // const data = await response.json();
    // return this.transformQuoteData(data);

    return this.getMockQuote(symbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.all(symbols.map((symbol) => this.getQuote(symbol)));
    return quotes;
  }

  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date,
  ): Promise<HistoricalData[]> {
    // Generate mock historical data
    const data: HistoricalData[] = [];
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let basePrice = this.mockQuotes[symbol]?.price || 100;

    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Generate realistic price movements
      const volatility = 0.02; // 2% daily volatility
      const trend = 0.0002; // Slight upward trend
      const randomWalk = (Math.random() - 0.5) * 2 * volatility;

      basePrice = basePrice * (1 + trend + randomWalk);

      const dayVariation = basePrice * 0.01;
      const open = basePrice + (Math.random() - 0.5) * dayVariation;
      const close = basePrice + (Math.random() - 0.5) * dayVariation;
      const high = Math.max(open, close) + Math.random() * dayVariation;
      const low = Math.min(open, close) - Math.random() * dayVariation;

      data.push({
        date,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(10000000 + Math.random() * 50000000),
        adjustedClose: Number(close.toFixed(2)),
      });
    }

    return data;
  }

  private getMockQuote(symbol: string): StockQuote {
    const baseData = this.mockQuotes[symbol] || {
      name: symbol,
      price: 100,
      previousClose: 100,
      marketCap: 100e9,
    };

    // Add realistic variations
    const changePercent = (Math.random() - 0.5) * 0.05; // ±2.5%
    const price = baseData.previousClose! * (1 + changePercent);
    const change = price - baseData.previousClose!;

    const dayVariation = price * 0.02;
    const dayHigh = price + Math.random() * dayVariation;
    const dayLow = price - Math.random() * dayVariation;

    return {
      symbol,
      name: baseData.name!,
      price: Number(price.toFixed(2)),
      previousClose: baseData.previousClose!,
      change: Number(change.toFixed(2)),
      changePercent: Number((changePercent * 100).toFixed(2)),
      volume: Math.floor(10000000 + Math.random() * 50000000),
      marketCap: baseData.marketCap!,
      dayHigh: Number(dayHigh.toFixed(2)),
      dayLow: Number(dayLow.toFixed(2)),
      week52High: Number((price * 1.3).toFixed(2)),
      week52Low: Number((price * 0.7).toFixed(2)),
      timestamp: new Date(),
    };
  }

  // Subscribe to real-time updates (using WebSocket in production)
  subscribeToQuotes(symbols: string[], callback: (quotes: StockQuote[]) => void): () => void {
    const interval = setInterval(async () => {
      const quotes = await this.getMultipleQuotes(symbols);
      callback(quotes);
    }, 5000); // Update every 5 seconds

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

export const yahooFinance = new YahooFinanceProvider();

// Korean Stock Market Data Provider
// Simulates real-time data from KOSPI/KOSDAQ

interface KoreanStockQuote {
  symbol: string;
  name: string;
  nameKr: string;
  market: 'KOSPI' | 'KOSDAQ';
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  tradingValue: number; // 거래대금
  marketCap: number;
  foreignRatio: number; // 외국인 보유 비율
  per: number; // Price-to-Earnings Ratio
  pbr: number; // Price-to-Book Ratio
  dividend: number; // 배당수익률
  timestamp: Date;
}

export class KoreanStockProvider {
  private stocks: Record<string, Partial<KoreanStockQuote>> = {
    '005930': {
      name: 'Samsung Electronics',
      nameKr: '삼성전자',
      market: 'KOSPI',
      price: 71800,
      previousClose: 71200,
      marketCap: 428.7e12,
      foreignRatio: 51.2,
      per: 13.5,
      pbr: 1.2,
      dividend: 2.8,
    },
    '035420': {
      name: 'NAVER',
      nameKr: '네이버',
      market: 'KOSPI',
      price: 223500,
      previousClose: 221000,
      marketCap: 36.6e12,
      foreignRatio: 48.3,
      per: 28.4,
      pbr: 2.1,
      dividend: 0.5,
    },
    '000660': {
      name: 'SK Hynix',
      nameKr: 'SK하이닉스',
      market: 'KOSPI',
      price: 129800,
      previousClose: 128500,
      marketCap: 94.5e12,
      foreignRatio: 52.8,
      per: 8.2,
      pbr: 1.8,
      dividend: 1.2,
    },
    '035720': {
      name: 'Kakao',
      nameKr: '카카오',
      market: 'KOSPI',
      price: 43650,
      previousClose: 43200,
      marketCap: 19.4e12,
      foreignRatio: 31.5,
      per: 45.2,
      pbr: 1.5,
      dividend: 0.3,
    },
    '207940': {
      name: 'Samsung Biologics',
      nameKr: '삼성바이오로직스',
      market: 'KOSPI',
      price: 785000,
      previousClose: 780000,
      marketCap: 55.8e12,
      foreignRatio: 12.5,
      per: 82.3,
      pbr: 5.2,
      dividend: 0,
    },
    '005380': {
      name: 'Hyundai Motor',
      nameKr: '현대차',
      market: 'KOSPI',
      price: 228000,
      previousClose: 226500,
      marketCap: 48.7e12,
      foreignRatio: 35.2,
      per: 5.8,
      pbr: 0.8,
      dividend: 4.2,
    },
    '373220': {
      name: 'LG Energy Solution',
      nameKr: 'LG에너지솔루션',
      market: 'KOSPI',
      price: 425000,
      previousClose: 422000,
      marketCap: 99.5e12,
      foreignRatio: 8.2,
      per: 58.5,
      pbr: 3.8,
      dividend: 0,
    },
    '006400': {
      name: 'Samsung SDI',
      nameKr: '삼성SDI',
      market: 'KOSPI',
      price: 438000,
      previousClose: 435000,
      marketCap: 30.1e12,
      foreignRatio: 45.8,
      per: 22.3,
      pbr: 1.9,
      dividend: 1.1,
    },
  };

  async getQuote(symbol: string): Promise<KoreanStockQuote> {
    const baseData = this.stocks[symbol];
    if (!baseData) {
      throw new Error(`Stock symbol ${symbol} not found`);
    }

    // Simulate real-time price changes
    const changePercent = (Math.random() - 0.5) * 0.06; // ±3%
    const price = baseData.previousClose! * (1 + changePercent);
    const change = price - baseData.previousClose!;

    // Calculate trading value (거래대금) in KRW
    const volume = Math.floor(100000 + Math.random() * 5000000);
    const tradingValue = volume * price;

    return {
      symbol,
      name: baseData.name!,
      nameKr: baseData.nameKr!,
      market: baseData.market!,
      price: Math.round(price),
      previousClose: baseData.previousClose!,
      change: Math.round(change),
      changePercent: Number((changePercent * 100).toFixed(2)),
      volume,
      tradingValue: Math.round(tradingValue),
      marketCap: baseData.marketCap!,
      foreignRatio: baseData.foreignRatio! + (Math.random() - 0.5) * 0.5,
      per: baseData.per!,
      pbr: baseData.pbr!,
      dividend: baseData.dividend!,
      timestamp: new Date(),
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<KoreanStockQuote[]> {
    return Promise.all(symbols.map((symbol) => this.getQuote(symbol)));
  }

  async getTopMovers(market?: 'KOSPI' | 'KOSDAQ'): Promise<{
    gainers: KoreanStockQuote[];
    losers: KoreanStockQuote[];
  }> {
    const allSymbols = Object.keys(this.stocks);
    const quotes = await this.getMultipleQuotes(allSymbols);

    const filteredQuotes = market ? quotes.filter((q) => q.market === market) : quotes;

    const sorted = filteredQuotes.sort((a, b) => b.changePercent - a.changePercent);

    return {
      gainers: sorted.slice(0, 5),
      losers: sorted.slice(-5).reverse(),
    };
  }

  async getMarketIndices(): Promise<{
    kospi: { value: number; change: number; changePercent: number };
    kosdaq: { value: number; change: number; changePercent: number };
    kospi200: { value: number; change: number; changePercent: number };
  }> {
    // Simulate market indices
    const kospiBase = 2650;
    const kosdaqBase = 850;
    const kospi200Base = 350;

    const generateIndex = (base: number) => {
      const changePercent = (Math.random() - 0.5) * 0.03; // ±1.5%
      const value = base * (1 + changePercent);
      const change = value - base;

      return {
        value: Number(value.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number((changePercent * 100).toFixed(2)),
      };
    };

    return {
      kospi: generateIndex(kospiBase),
      kosdaq: generateIndex(kosdaqBase),
      kospi200: generateIndex(kospi200Base),
    };
  }

  // Subscribe to real-time updates
  subscribeToQuotes(symbols: string[], callback: (quotes: KoreanStockQuote[]) => void): () => void {
    const interval = setInterval(async () => {
      const quotes = await this.getMultipleQuotes(symbols);
      callback(quotes);
    }, 3000); // Update every 3 seconds for Korean stocks

    return () => clearInterval(interval);
  }
}

export const koreanStocks = new KoreanStockProvider();

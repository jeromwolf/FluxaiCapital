/**
 * Unified Market Data Service
 * Integrates multiple market data providers
 */

import { AlphaVantageProvider } from './providers/alpha-vantage';
import { DartProvider, getDartProvider } from './providers/dart';
import { FinnhubProvider } from './providers/finnhub';
import { KoreanStockProvider } from './providers/korean-stocks';
import { TwelveDataProvider } from './providers/twelve-data';
import { YahooFinanceProvider } from './providers/yahoo-finance';
import {
  MarketQuote,
  MarketCandle,
  MarketNews,
  TechnicalIndicator,
  MarketIndex,
  SectorPerformance,
  MarketProvider,
  MarketDataConfig,
  DartDisclosure,
  DartFinancialStatement,
  DartMajorShareholder,
  DartCompanyInfo,
} from './types';

export class MarketDataService {
  private config: MarketDataConfig;
  private providers: Map<MarketProvider, any> = new Map();
  private dartProvider?: DartProvider;

  constructor(config: MarketDataConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize main provider based on config
    switch (this.config.provider) {
      case 'alphaVantage':
        this.providers.set('alphaVantage', new AlphaVantageProvider());
        break;
      case 'finnhub':
        this.providers.set('finnhub', new FinnhubProvider());
        break;
      case 'twelveData':
        this.providers.set('twelveData', new TwelveDataProvider());
        break;
      case 'yahoo':
        this.providers.set('yahoo', new YahooFinanceProvider());
        break;
      case 'korean':
        this.providers.set('korean', new KoreanStockProvider());
        break;
    }

    // Initialize DART provider if API key is available
    try {
      if (process.env.DART_API_KEY && process.env.DART_API_KEY.trim() !== '') {
        this.dartProvider = getDartProvider();
      }
    } catch (error) {
      console.warn('DART provider not available:', error);
      // Don't throw, just log warning
    }
  }

  private getProvider(): any {
    const provider = this.providers.get(this.config.provider);
    if (!provider) {
      throw new Error(`Provider ${this.config.provider} not initialized`);
    }
    return provider;
  }

  // Market Data Methods
  async getQuote(symbol: string): Promise<MarketQuote> {
    return this.getProvider().getQuote(symbol);
  }

  async getMultipleQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return this.getProvider().getMultipleQuotes(symbols);
  }

  async getCandles(
    symbol: string,
    interval: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day',
    limit?: number,
  ): Promise<MarketCandle[]> {
    return this.getProvider().getCandles(symbol, interval, limit);
  }

  async getNews(symbol?: string, limit?: number): Promise<MarketNews[]> {
    return this.getProvider().getNews(symbol, limit);
  }

  async getTechnicalIndicators(
    symbol: string,
    indicator: 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'BB',
    interval: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day',
    timePeriod?: number,
  ): Promise<TechnicalIndicator[]> {
    if (this.getProvider().getTechnicalIndicators) {
      return this.getProvider().getTechnicalIndicators(symbol, indicator, interval, timePeriod);
    }
    throw new Error('Technical indicators not supported by current provider');
  }

  async getMarketIndices(): Promise<MarketIndex[]> {
    if (this.getProvider().getMarketIndices) {
      return this.getProvider().getMarketIndices();
    }
    throw new Error('Market indices not supported by current provider');
  }

  async getSectorPerformance(): Promise<SectorPerformance[]> {
    if (this.getProvider().getSectorPerformance) {
      return this.getProvider().getSectorPerformance();
    }
    throw new Error('Sector performance not supported by current provider');
  }

  // DART API Methods (Korean regulatory disclosures)
  async getDartDisclosures(params: {
    corpCode?: string;
    stockCode?: string;
    startDate?: string;
    endDate?: string;
    reportType?: string;
    pageNo?: number;
    pageCount?: number;
  }): Promise<DartDisclosure[]> {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.getDisclosures(params);
  }

  async getDartFinancialStatements(params: {
    corpCode?: string;
    stockCode?: string;
    year: string;
    reportCode: string;
    fsDiv?: 'CFS' | 'OFS';
  }): Promise<DartFinancialStatement[]> {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.getFinancialStatements(params);
  }

  async getDartMajorShareholders(params: {
    corpCode?: string;
    stockCode?: string;
  }): Promise<DartMajorShareholder[]> {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.getMajorShareholders(params);
  }

  async getDartCompanyInfo(params: {
    corpCode?: string;
    stockCode?: string;
  }): Promise<DartCompanyInfo | null> {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.getCompanyInfo(params);
  }

  async getDartKeyFinancialMetrics(params: {
    corpCode?: string;
    stockCode?: string;
    year?: string;
  }): Promise<{
    revenue?: number;
    operatingProfit?: number;
    netIncome?: number;
    totalAssets?: number;
    totalEquity?: number;
    totalLiabilities?: number;
    eps?: number;
    roe?: number;
    roa?: number;
    debtRatio?: number;
  }> {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.getKeyFinancialMetrics(params);
  }

  async searchDartCompanies(query: string): Promise<
    Array<{
      corpCode: string;
      corpName: string;
      stockCode?: string;
    }>
  > {
    if (!this.dartProvider) {
      throw new Error('DART provider not initialized. Please configure DART_API_KEY.');
    }
    return this.dartProvider.searchCompanies(query);
  }

  getDartDocumentViewerUrl(rceptNo: string): string {
    // Static method - can call directly on class
    return DartProvider.getDocumentViewerUrl(rceptNo);
  }

  // WebSocket methods
  subscribeToQuotes(symbols: string[], callback: (quotes: MarketQuote[]) => void): () => void {
    if (this.getProvider().subscribeToQuotes) {
      return this.getProvider().subscribeToQuotes(symbols, callback);
    }
    throw new Error('Real-time quotes not supported by current provider');
  }

  // Check if DART is available
  isDartAvailable(): boolean {
    return !!this.dartProvider;
  }
}

// Export factory function
export function createMarketDataService(config?: Partial<MarketDataConfig>): MarketDataService {
  const defaultConfig: MarketDataConfig = {
    provider: 'korean', // Default to Korean stocks mock provider
    enableWebSocket: false,
    cacheTimeout: 60000, // 1 minute
  };

  return new MarketDataService({ ...defaultConfig, ...config });
}

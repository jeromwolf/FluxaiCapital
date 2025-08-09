export * from './types';
export * from './service';

// Re-export providers for backwards compatibility
export { yahooFinance } from './providers/yahoo-finance';
export { koreanStocks } from './providers/korean-stocks';
export { finnhub } from './providers/finnhub';
export { alphaVantage } from './providers/alpha-vantage';
export { twelveData } from './providers/twelve-data';

// Legacy MarketDataService for backwards compatibility
import { createMarketDataService } from './service';
export const marketData = createMarketDataService();
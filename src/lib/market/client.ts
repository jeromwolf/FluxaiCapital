// Market data client

import { MarketPrice, MarketTicker, MarketCandle, MarketDataProvider } from './types'
import * as mockProvider from './providers/mock'

export class MarketDataClient {
  private provider: MarketDataProvider
  private mockWebSocket?: mockProvider.MockMarketWebSocket
  
  constructor(provider: MarketDataProvider = 'mock') {
    this.provider = provider
    
    if (provider === 'mock') {
      this.mockWebSocket = new mockProvider.MockMarketWebSocket()
    }
  }
  
  async getPrice(symbol: string): Promise<MarketPrice | null> {
    switch (this.provider) {
      case 'mock':
        return mockProvider.generateMarketPrice(symbol)
      default:
        throw new Error(`Provider ${this.provider} not implemented`)
    }
  }
  
  async getPrices(symbols: string[]): Promise<MarketPrice[]> {
    const prices = await Promise.all(
      symbols.map(symbol => this.getPrice(symbol))
    )
    return prices.filter((price): price is MarketPrice => price !== null)
  }
  
  async getCandles(
    symbol: string,
    interval: '1m' | '5m' | '1h' | '1d',
    count: number = 100
  ): Promise<MarketCandle[]> {
    switch (this.provider) {
      case 'mock':
        return mockProvider.generateMarketCandles(symbol, interval, count)
      default:
        throw new Error(`Provider ${this.provider} not implemented`)
    }
  }
  
  subscribeToPrice(
    symbol: string,
    callback: (ticker: MarketTicker) => void
  ): () => void {
    switch (this.provider) {
      case 'mock':
        this.mockWebSocket?.subscribe(symbol, callback)
        return () => this.mockWebSocket?.unsubscribe(symbol, callback)
      default:
        throw new Error(`Provider ${this.provider} not implemented`)
    }
  }
  
  getAvailableSymbols(): string[] {
    switch (this.provider) {
      case 'mock':
        return mockProvider.getAvailableSymbols()
      default:
        return []
    }
  }
  
  close() {
    if (this.mockWebSocket) {
      this.mockWebSocket.close()
    }
  }
}

// Singleton instance
let marketDataClient: MarketDataClient | null = null

export function getMarketDataClient(): MarketDataClient {
  if (!marketDataClient) {
    marketDataClient = new MarketDataClient(
      (process.env["NEXT_PUBLIC_MARKET_DATA_PROVIDER"] as MarketDataProvider) || 'mock'
    )
  }
  return marketDataClient
}
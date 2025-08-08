// Market data types

export interface MarketPrice {
  symbol: string
  name: string
  price: number
  currency: string
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high24h?: number
  low24h?: number
  updatedAt: Date
}

export interface MarketTicker {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

export interface MarketCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketOrderBook {
  symbol: string
  bids: Array<[number, number]> // [price, quantity]
  asks: Array<[number, number]> // [price, quantity]
  timestamp: number
}

export type MarketDataProvider = 'mock' | 'yahoo' | 'upbit' | 'binance' | 'krx'

export interface MarketDataConfig {
  provider: MarketDataProvider
  apiKey?: string
  secretKey?: string
  baseUrl?: string
  websocketUrl?: string
}
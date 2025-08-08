// Application constants

export const APP_NAME = process.env["NEXT_PUBLIC_APP_NAME"] || 'FLUX AI Capital';
export const APP_URL = process.env["NEXT_PUBLIC_APP_URL"] || 'https://flux.ai.kr';

// Feature flags
export const FEATURES = {
  TRADING_ENABLED: process.env["NEXT_PUBLIC_ENABLE_TRADING"] === 'true',
  AI_FEATURES_ENABLED: process.env["NEXT_PUBLIC_ENABLE_AI_FEATURES"] === 'true',
  MAINTENANCE_MODE: process.env["NEXT_PUBLIC_MAINTENANCE_MODE"] === 'true',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  PORTFOLIO: '/api/portfolio',
  MARKET: '/api/market',
  TRADING: '/api/trading',
  ANALYTICS: '/api/analytics',
  USER: '/api/user',
} as const;

// Supported markets
export const SUPPORTED_MARKETS = {
  CRYPTO: ['UPBIT', 'BINANCE'],
  STOCK: ['KRX', 'NASDAQ'],
} as const;

// Currency constants
export const CURRENCIES = {
  KRW: { code: 'KRW', symbol: '₩', name: '원' },
  USD: { code: 'USD', symbol: '$', name: '달러' },
  BTC: { code: 'BTC', symbol: '₿', name: '비트코인' },
  ETH: { code: 'ETH', symbol: 'Ξ', name: '이더리움' },
} as const;

// Time intervals
export const TIME_INTERVALS = {
  REFRESH_PORTFOLIO: 30000, // 30 seconds
  REFRESH_MARKET: 5000, // 5 seconds
  REFRESH_ORDERS: 10000, // 10 seconds
} as const;
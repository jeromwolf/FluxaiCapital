// 백테스팅 관련 타입 정의

export interface BacktestConfig {
  strategyId: string;
  portfolioId: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  currency: string;
  benchmark?: string;
  rebalancePeriod?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  transactionCost?: number; // 거래 수수료 (%)
  slippage?: number; // 슬리피지 (%)
}

export interface BacktestResult {
  id: string;
  config: BacktestConfig;
  performance: PerformanceMetrics;
  trades: Trade[];
  equity: EquityPoint[];
  holdings: HoldingSnapshot[];
  createdAt: Date;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  bestTrade: number;
  worstTrade: number;
  calmarRatio: number;
  alpha: number;
  beta: number;
}

export interface Trade {
  id: string;
  date: Date;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  amount: number;
  commission: number;
  slippage: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface EquityPoint {
  date: Date;
  value: number;
  drawdown: number;
  benchmarkValue?: number;
}

export interface HoldingSnapshot {
  date: Date;
  holdings: {
    symbol: string;
    quantity: number;
    price: number;
    value: number;
    weight: number;
  }[];
  cash: number;
  totalValue: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'buyAndHold' | 'momentum' | 'meanReversion' | 'pairs' | 'custom';
  parameters: Record<string, any>;
}

export interface MarketData {
  symbol: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface Signal {
  date: Date;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  quantity?: number;
  confidence?: number;
  reason?: string;
}
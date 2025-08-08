export interface BacktestStrategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'meanReversion' | 'valueBased' | 'custom';
  parameters: Record<string, any>;
}

export interface BacktestConfig {
  strategyId: string;
  symbols: string[];
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  commission: number; // percentage
  slippage: number; // percentage
}

export interface BacktestTrade {
  date: Date;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  commission: number;
  slippage: number;
  totalCost: number;
}

export interface BacktestPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  metrics: BacktestMetrics;
  trades: BacktestTrade[];
  equityCurve: Array<{
    date: Date;
    value: number;
    drawdown: number;
  }>;
  finalPositions: BacktestPosition[];
  dailyReturns: Array<{
    date: Date;
    return: number;
  }>;
}
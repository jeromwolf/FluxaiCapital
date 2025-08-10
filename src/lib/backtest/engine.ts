import { getMeanReversionSignal } from './strategies/meanReversion';
import { calculateMomentumSignal } from './strategies/momentum';
import {
  BacktestConfig,
  BacktestResult,
  BacktestTrade,
  BacktestPosition,
  BacktestMetrics,
} from './types';

interface PriceData {
  date: Date;
  symbol: string;
  price: number;
}

export class BacktestEngine {
  private config: BacktestConfig;
  private cash: number;
  private positions: Map<string, BacktestPosition>;
  private trades: BacktestTrade[];
  private equityCurve: Array<{ date: Date; value: number; drawdown: number }>;
  private dailyReturns: Array<{ date: Date; return: number }>;
  private maxEquity: number;

  constructor(config: BacktestConfig) {
    this.config = config;
    this.cash = config.initialCapital;
    this.positions = new Map();
    this.trades = [];
    this.equityCurve = [];
    this.dailyReturns = [];
    this.maxEquity = config.initialCapital;
  }

  async run(priceData: PriceData[]): Promise<BacktestResult> {
    // Group price data by symbol
    const pricesBySymbol = this.groupPricesBySymbol(priceData);

    // Get all unique dates
    const dates = [...new Set(priceData.map((p) => p.date.toISOString()))].sort();

    let previousValue = this.config.initialCapital;

    for (const dateStr of dates) {
      const date = new Date(dateStr);

      // Update current prices
      this.updatePositionPrices(pricesBySymbol, date);

      // Generate signals and execute trades
      for (const symbol of this.config.symbols) {
        const prices = this.getPriceHistory(pricesBySymbol, symbol, date);
        if (prices.length > 0) {
          const signal = this.generateSignal(prices);

          if (signal === 'BUY' && !this.positions.has(symbol)) {
            this.executeBuy(symbol, prices[prices.length - 1], date);
          } else if (signal === 'SELL' && this.positions.has(symbol)) {
            this.executeSell(symbol, prices[prices.length - 1], date);
          }
        }
      }

      // Record equity curve
      const currentValue = this.getPortfolioValue();
      const drawdown = this.maxEquity > 0 ? (this.maxEquity - currentValue) / this.maxEquity : 0;

      this.equityCurve.push({
        date,
        value: currentValue,
        drawdown,
      });

      // Record daily returns
      if (previousValue > 0) {
        const dailyReturn = (currentValue - previousValue) / previousValue;
        this.dailyReturns.push({ date, return: dailyReturn });
      }

      // Update max equity
      if (currentValue > this.maxEquity) {
        this.maxEquity = currentValue;
      }

      previousValue = currentValue;
    }

    const metrics = this.calculateMetrics();

    return {
      config: this.config,
      metrics,
      trades: this.trades,
      equityCurve: this.equityCurve,
      finalPositions: Array.from(this.positions.values()),
      dailyReturns: this.dailyReturns,
    };
  }

  private groupPricesBySymbol(priceData: PriceData[]): Map<string, PriceData[]> {
    const grouped = new Map<string, PriceData[]>();

    for (const data of priceData) {
      if (!grouped.has(data.symbol)) {
        grouped.set(data.symbol, []);
      }
      grouped.get(data.symbol)!.push(data);
    }

    // Sort by date
    for (const [symbol, prices] of grouped) {
      prices.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    return grouped;
  }

  private getPriceHistory(
    pricesBySymbol: Map<string, PriceData[]>,
    symbol: string,
    currentDate: Date,
  ): number[] {
    const symbolPrices = pricesBySymbol.get(symbol) || [];
    return symbolPrices.filter((p) => p.date <= currentDate).map((p) => p.price);
  }

  private updatePositionPrices(pricesBySymbol: Map<string, PriceData[]>, date: Date) {
    for (const [symbol, position] of this.positions) {
      const symbolPrices = pricesBySymbol.get(symbol) || [];
      const currentPriceData = symbolPrices.find(
        (p) => p.date.toDateString() === date.toDateString(),
      );

      if (currentPriceData) {
        position.currentPrice = currentPriceData.price;
        position.marketValue = position.quantity * position.currentPrice;
        position.unrealizedPnL = position.marketValue - position.quantity * position.averagePrice;
      }
    }
  }

  private generateSignal(prices: number[]): 'BUY' | 'SELL' | 'HOLD' {
    // Use momentum strategy by default
    // TODO: Switch based on strategy type in config
    return calculateMomentumSignal(prices, 20);
  }

  private executeBuy(symbol: string, price: number, date: Date) {
    const positionSize = this.config.initialCapital * 0.1; // 10% position size
    if (this.cash < positionSize) return;

    const slippageAmount = price * (this.config.slippage / 100);
    const executionPrice = price + slippageAmount;
    const quantity = Math.floor(positionSize / executionPrice);
    if (quantity === 0) return;

    const commissionAmount = quantity * executionPrice * (this.config.commission / 100);
    const totalCost = quantity * executionPrice + commissionAmount;

    if (this.cash < totalCost) return;

    this.cash -= totalCost;

    const trade: BacktestTrade = {
      date,
      symbol,
      type: 'BUY',
      quantity,
      price: executionPrice,
      commission: commissionAmount,
      slippage: slippageAmount * quantity,
      totalCost,
    };
    this.trades.push(trade);

    this.positions.set(symbol, {
      symbol,
      quantity,
      averagePrice: executionPrice,
      currentPrice: executionPrice,
      marketValue: quantity * executionPrice,
      unrealizedPnL: 0,
      realizedPnL: 0,
    });
  }

  private executeSell(symbol: string, price: number, date: Date) {
    const position = this.positions.get(symbol);
    if (!position) return;

    const slippageAmount = price * (this.config.slippage / 100);
    const executionPrice = price - slippageAmount;
    const { quantity } = position;

    const grossProceeds = quantity * executionPrice;
    const commissionAmount = grossProceeds * (this.config.commission / 100);
    const netProceeds = grossProceeds - commissionAmount;

    this.cash += netProceeds;

    const realizedPnL = netProceeds - position.quantity * position.averagePrice;

    const trade: BacktestTrade = {
      date,
      symbol,
      type: 'SELL',
      quantity,
      price: executionPrice,
      commission: commissionAmount,
      slippage: slippageAmount * quantity,
      totalCost: -netProceeds,
    };
    this.trades.push(trade);

    this.positions.delete(symbol);
  }

  private getPortfolioValue(): number {
    let totalValue = this.cash;
    for (const position of this.positions.values()) {
      totalValue += position.marketValue;
    }
    return totalValue;
  }

  private calculateMetrics(): BacktestMetrics {
    const { initialCapital } = this.config;
    const finalValue = this.getPortfolioValue();
    const totalReturn = ((finalValue - initialCapital) / initialCapital) * 100;

    // Calculate annualized return
    const days = this.equityCurve.length;
    const years = days / 252; // Trading days
    const annualizedReturn =
      years > 0 ? (Math.pow(finalValue / initialCapital, 1 / years) - 1) * 100 : 0;

    // Calculate Sharpe ratio
    const avgReturn =
      this.dailyReturns.reduce((sum, r) => sum + r.return, 0) / this.dailyReturns.length;
    const stdDev = Math.sqrt(
      this.dailyReturns.reduce((sum, r) => sum + Math.pow(r.return - avgReturn, 2), 0) /
        this.dailyReturns.length,
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn * Math.sqrt(252)) / stdDev : 0;

    // Calculate max drawdown
    const maxDrawdown = Math.max(...this.equityCurve.map((e) => e.drawdown)) * 100;

    // Calculate win rate
    const sellTrades = this.trades.filter((t) => t.type === 'SELL');
    const winningTrades = sellTrades.filter((trade, index) => {
      const buyIndex = this.trades.findIndex(
        (t) => t.symbol === trade.symbol && t.type === 'BUY' && t.date < trade.date,
      );
      if (buyIndex >= 0) {
        const buyTrade = this.trades[buyIndex];
        return trade.price > buyTrade.price;
      }
      return false;
    }).length;

    const winRate = sellTrades.length > 0 ? (winningTrades / sellTrades.length) * 100 : 0;

    // Calculate profit factor
    let grossProfits = 0;
    let grossLosses = 0;

    sellTrades.forEach((trade, index) => {
      const buyIndex = this.trades.findIndex(
        (t) => t.symbol === trade.symbol && t.type === 'BUY' && t.date < trade.date,
      );
      if (buyIndex >= 0) {
        const buyTrade = this.trades[buyIndex];
        const pnl = (trade.price - buyTrade.price) * trade.quantity;
        if (pnl > 0) {
          grossProfits += pnl;
        } else {
          grossLosses += Math.abs(pnl);
        }
      }
    });

    const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : 0;

    return {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      totalTrades: this.trades.length,
      winningTrades,
      losingTrades: sellTrades.length - winningTrades,
    };
  }
}

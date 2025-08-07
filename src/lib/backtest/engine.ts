import {
  BacktestConfig,
  BacktestResult,
  Trade,
  EquityPoint,
  HoldingSnapshot,
  PerformanceMetrics,
  MarketData,
  Signal,
} from './types';

export class BacktestEngine {
  private config: BacktestConfig;
  private marketData: Map<string, MarketData[]>;
  private trades: Trade[] = [];
  private equity: EquityPoint[] = [];
  private holdings: Map<string, number> = new Map();
  private cash: number;
  private currentDate: Date;
  private holdingSnapshots: HoldingSnapshot[] = [];

  constructor(config: BacktestConfig, marketData: Map<string, MarketData[]>) {
    this.config = config;
    this.marketData = marketData;
    this.cash = config.initialCapital;
    this.currentDate = config.startDate;
  }

  async run(strategy: (data: MarketData[], holdings: Map<string, number>) => Signal[]): Promise<BacktestResult> {
    // 날짜별로 백테스트 실행
    const dates = this.getUniqueDates();
    
    for (const date of dates) {
      if (date < this.config.startDate || date > this.config.endDate) {
        continue;
      }

      this.currentDate = date;

      // 해당 날짜의 시장 데이터 가져오기
      const dailyData = this.getDataForDate(date);
      if (dailyData.length === 0) continue;

      // 전략 실행하여 시그널 생성
      const signals = strategy(dailyData, new Map(this.holdings));

      // 시그널에 따라 거래 실행
      for (const signal of signals) {
        await this.executeSignal(signal);
      }

      // 포트폴리오 가치 계산 및 기록
      this.recordEquity(date);
      this.recordHoldings(date);
    }

    // 성과 지표 계산
    const performance = this.calculatePerformance();

    return {
      id: `backtest-${Date.now()}`,
      config: this.config,
      performance,
      trades: this.trades,
      equity: this.equity,
      holdings: this.holdingSnapshots,
      createdAt: new Date(),
    };
  }

  private async executeSignal(signal: Signal): Promise<void> {
    const marketData = this.getLatestPrice(signal.symbol, signal.date);
    if (!marketData) return;

    const price = marketData.close;
    let quantity = signal.quantity || 0;
    
    if (signal.action === 'buy') {
      // 구매 가능한 수량 계산
      if (!quantity) {
        const availableCash = this.cash * 0.95; // 현금의 95% 사용
        quantity = Math.floor(availableCash / price);
      }

      if (quantity > 0) {
        const amount = quantity * price;
        const commission = amount * (this.config.transactionCost || 0.001);
        const slippage = amount * (this.config.slippage || 0.0005);
        const totalCost = amount + commission + slippage;

        if (totalCost <= this.cash) {
          this.cash -= totalCost;
          const currentHolding = this.holdings.get(signal.symbol) || 0;
          this.holdings.set(signal.symbol, currentHolding + quantity);

          this.trades.push({
            id: `trade-${this.trades.length + 1}`,
            date: signal.date,
            symbol: signal.symbol,
            side: 'buy',
            quantity,
            price,
            amount,
            commission,
            slippage,
          });
        }
      }
    } else if (signal.action === 'sell') {
      const currentHolding = this.holdings.get(signal.symbol) || 0;
      
      if (!quantity || quantity > currentHolding) {
        quantity = currentHolding;
      }

      if (quantity > 0) {
        const amount = quantity * price;
        const commission = amount * (this.config.transactionCost || 0.001);
        const slippage = amount * (this.config.slippage || 0.0005);
        const netAmount = amount - commission - slippage;

        this.cash += netAmount;
        this.holdings.set(signal.symbol, currentHolding - quantity);

        // PnL 계산 (간단히 평균 매수가 기준)
        const avgBuyPrice = this.calculateAverageBuyPrice(signal.symbol);
        const pnl = (price - avgBuyPrice) * quantity - commission - slippage;
        const pnlPercent = (pnl / (avgBuyPrice * quantity)) * 100;

        this.trades.push({
          id: `trade-${this.trades.length + 1}`,
          date: signal.date,
          symbol: signal.symbol,
          side: 'sell',
          quantity,
          price,
          amount,
          commission,
          slippage,
          pnl,
          pnlPercent,
        });

        if (this.holdings.get(signal.symbol) === 0) {
          this.holdings.delete(signal.symbol);
        }
      }
    }
  }

  private recordEquity(date: Date): void {
    const totalValue = this.calculatePortfolioValue(date);
    const drawdown = this.calculateDrawdown(totalValue);

    this.equity.push({
      date,
      value: totalValue,
      drawdown,
    });
  }

  private recordHoldings(date: Date): void {
    const holdingsList = [];
    let totalValue = this.cash;

    for (const [symbol, quantity] of this.holdings) {
      const price = this.getLatestPrice(symbol, date)?.close || 0;
      const value = quantity * price;
      totalValue += value;

      holdingsList.push({
        symbol,
        quantity,
        price,
        value,
        weight: 0, // 나중에 계산
      });
    }

    // 가중치 계산
    holdingsList.forEach(holding => {
      holding.weight = (holding.value / totalValue) * 100;
    });

    this.holdingSnapshots.push({
      date,
      holdings: holdingsList,
      cash: this.cash,
      totalValue,
    });
  }

  private calculatePortfolioValue(date: Date): number {
    let value = this.cash;

    for (const [symbol, quantity] of this.holdings) {
      const price = this.getLatestPrice(symbol, date)?.close || 0;
      value += quantity * price;
    }

    return value;
  }

  private calculateDrawdown(currentValue: number): number {
    if (this.equity.length === 0) return 0;

    const maxValue = Math.max(...this.equity.map(e => e.value), currentValue);
    return ((currentValue - maxValue) / maxValue) * 100;
  }

  private calculateAverageBuyPrice(symbol: string): number {
    const buyTrades = this.trades.filter(t => t.symbol === symbol && t.side === 'buy');
    if (buyTrades.length === 0) return 0;

    const totalAmount = buyTrades.reduce((sum, t) => sum + t.amount, 0);
    const totalQuantity = buyTrades.reduce((sum, t) => sum + t.quantity, 0);

    return totalAmount / totalQuantity;
  }

  private calculatePerformance(): PerformanceMetrics {
    const returns = this.calculateReturns();
    const totalReturn = ((this.equity[this.equity.length - 1].value - this.config.initialCapital) / this.config.initialCapital) * 100;
    const annualizedReturn = this.annualizeReturn(totalReturn);
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(annualizedReturn, volatility);
    const sortinoRatio = this.calculateSortinoRatio(returns);
    const maxDrawdown = Math.min(...this.equity.map(e => e.drawdown));
    const maxDrawdownDuration = this.calculateMaxDrawdownDuration();
    
    const winningTrades = this.trades.filter(t => t.pnl && t.pnl > 0);
    const losingTrades = this.trades.filter(t => t.pnl && t.pnl < 0);
    const winRate = (winningTrades.length / (winningTrades.length + losingTrades.length)) * 100;
    
    const averageWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    
    const averageLoss = losingTrades.length > 0 
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
      : 0;
    
    const profitFactor = averageLoss > 0 ? averageWin / averageLoss : 0;
    const calmarRatio = maxDrawdown !== 0 ? annualizedReturn / Math.abs(maxDrawdown) : 0;

    return {
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      maxDrawdownDuration,
      winRate,
      profitFactor,
      totalTrades: this.trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageWin,
      averageLoss,
      bestTrade: Math.max(...this.trades.map(t => t.pnl || 0)),
      worstTrade: Math.min(...this.trades.map(t => t.pnl || 0)),
      calmarRatio,
      alpha: 0, // 추후 구현
      beta: 0, // 추후 구현
    };
  }

  private calculateReturns(): number[] {
    const returns: number[] = [];
    
    for (let i = 1; i < this.equity.length; i++) {
      const dailyReturn = ((this.equity[i].value - this.equity[i - 1].value) / this.equity[i - 1].value) * 100;
      returns.push(dailyReturn);
    }
    
    return returns;
  }

  private annualizeReturn(totalReturn: number): number {
    const days = this.equity.length;
    const years = days / 252; // 거래일 기준
    return Math.pow(1 + totalReturn / 100, 1 / years) - 1;
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // 연간 변동성
  }

  private calculateSharpeRatio(annualizedReturn: number, volatility: number, riskFreeRate: number = 0.02): number {
    return (annualizedReturn - riskFreeRate) / volatility;
  }

  private calculateSortinoRatio(returns: number[], targetReturn: number = 0): number {
    const downsidevReturns = returns.filter(r => r < targetReturn);
    if (downsidevReturns.length === 0) return 0;
    
    const downsideVariance = downsidevReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0) / downsidevReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance * 252);
    
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 252;
    return (meanReturn - targetReturn) / downsideDeviation;
  }

  private calculateMaxDrawdownDuration(): number {
    let maxDuration = 0;
    let currentDuration = 0;
    let peakValue = this.config.initialCapital;

    for (const point of this.equity) {
      if (point.value >= peakValue) {
        peakValue = point.value;
        currentDuration = 0;
      } else {
        currentDuration++;
        maxDuration = Math.max(maxDuration, currentDuration);
      }
    }

    return maxDuration;
  }

  private getUniqueDates(): Date[] {
    const dates = new Set<string>();
    
    for (const dataArray of this.marketData.values()) {
      dataArray.forEach(data => {
        dates.add(data.date.toISOString().split('T')[0]);
      });
    }
    
    return Array.from(dates)
      .sort()
      .map(dateStr => new Date(dateStr));
  }

  private getDataForDate(date: Date): MarketData[] {
    const result: MarketData[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    for (const [symbol, dataArray] of this.marketData) {
      const data = dataArray.find(d => d.date.toISOString().split('T')[0] === dateStr);
      if (data) {
        result.push(data);
      }
    }
    
    return result;
  }

  private getLatestPrice(symbol: string, date: Date): MarketData | undefined {
    const dataArray = this.marketData.get(symbol);
    if (!dataArray) return undefined;
    
    const dateStr = date.toISOString().split('T')[0];
    return dataArray.find(d => d.date.toISOString().split('T')[0] === dateStr);
  }
}
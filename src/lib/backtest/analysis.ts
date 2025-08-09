import { BacktestResult, BacktestTrade } from './types';

// Extended types for analysis
export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  alpha: number;
}

export interface EquityPoint {
  date: Date;
  value: number;
  drawdown: number;
}

export interface Trade {
  date: Date;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl?: number;
}

export interface AnalysisResult {
  riskMetrics: RiskMetrics;
  tradeAnalysis: TradeAnalysis;
  periodAnalysis: PeriodAnalysis[];
  benchmarkComparison?: BenchmarkComparison;
  recommendations: string[];
}

export interface RiskMetrics {
  valueAtRisk: {
    var95: number;
    var99: number;
    expectedShortfall95: number;
    expectedShortfall99: number;
  };
  riskAdjustedReturns: {
    treynorRatio: number;
    jensenAlpha: number;
    informationRatio: number;
  };
  drawdownAnalysis: {
    maxDrawdown: number;
    maxDrawdownDuration: number;
    avgDrawdown: number;
    recoveryTime: number;
    drawdownFrequency: number;
  };
}

export interface TradeAnalysis {
  profitDistribution: {
    profits: number[];
    losses: number[];
    breakeven: number;
  };
  tradeDuration: {
    avgHoldingPeriod: number;
    maxHoldingPeriod: number;
    minHoldingPeriod: number;
  };
  tradeTiming: {
    monthlyWinRate: Record<string, number>;
    weeklyWinRate: Record<string, number>;
    bestTradingMonth: string;
    worstTradingMonth: string;
  };
  consecutiveAnalysis: {
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    avgConsecutiveWins: number;
    avgConsecutiveLosses: number;
  };
}

export interface PeriodAnalysis {
  period: string;
  startDate: Date;
  endDate: Date;
  return: number;
  volatility: number;
  maxDrawdown: number;
  trades: number;
  winRate: number;
}

export interface BenchmarkComparison {
  relativeReturn: number;
  trackingError: number;
  informationRatio: number;
  upCapture: number;
  downCapture: number;
  correlation: number;
  beta: number;
  alpha: number;
}

export class BacktestAnalyzer {
  private result: BacktestResult;
  private equity: EquityPoint[];
  private trades: Trade[];
  private performance: PerformanceMetrics;

  constructor(result: BacktestResult) {
    this.result = result;
    // Transform BacktestResult to expected format
    this.equity = result.equityCurve.map((point) => ({
      date: point.date,
      value: point.value,
      drawdown: point.drawdown,
    }));

    this.trades = result.trades.map((trade) => ({
      date: trade.date,
      symbol: trade.symbol,
      type: trade.type,
      quantity: trade.quantity,
      price: trade.price,
      pnl: this.calculateTradePnL(trade),
    }));

    this.performance = {
      totalReturn: result.metrics.totalReturn,
      annualizedReturn: result.metrics.annualizedReturn,
      sharpeRatio: result.metrics.sharpeRatio,
      maxDrawdown: result.metrics.maxDrawdown,
      maxDrawdownDuration: this.calculateMaxDrawdownDuration(),
      winRate: result.metrics.winRate,
      profitFactor: result.metrics.profitFactor,
      totalTrades: result.metrics.totalTrades,
      winningTrades: result.metrics.winningTrades,
      losingTrades: result.metrics.losingTrades,
      alpha: 0, // Default value, would need benchmark to calculate
    };
  }

  private calculateTradePnL(trade: BacktestTrade): number {
    // Simplified P&L calculation - in real implementation would need more context
    return trade.type === 'SELL' ? trade.quantity * trade.price - trade.totalCost : 0;
  }

  private calculateMaxDrawdownDuration(): number {
    // Simplified calculation
    return 30; // Default 30 days
  }

  analyze(): AnalysisResult {
    const riskMetrics = this.calculateRiskMetrics();
    const tradeAnalysis = this.analyzeTradePatterns();
    const periodAnalysis = this.analyzePeriods();
    const recommendations = this.generateRecommendations();

    return {
      riskMetrics,
      tradeAnalysis,
      periodAnalysis,
      recommendations,
    };
  }

  private calculateRiskMetrics(): RiskMetrics {
    const returns = this.calculateDailyReturns();

    // Value at Risk 계산
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const var95Index = Math.floor(sortedReturns.length * 0.05);
    const var99Index = Math.floor(sortedReturns.length * 0.01);

    const var95 = sortedReturns[var95Index] || 0;
    const var99 = sortedReturns[var99Index] || 0;

    // Expected Shortfall (조건부 가치위험)
    const expectedShortfall95 =
      sortedReturns.slice(0, var95Index + 1).reduce((sum, ret) => sum + ret, 0) / (var95Index + 1);
    const expectedShortfall99 =
      sortedReturns.slice(0, var99Index + 1).reduce((sum, ret) => sum + ret, 0) / (var99Index + 1);

    // 드로우다운 분석
    const drawdownAnalysis = this.analyzeDrawdowns();

    return {
      valueAtRisk: {
        var95: var95 * 100,
        var99: var99 * 100,
        expectedShortfall95: expectedShortfall95 * 100,
        expectedShortfall99: expectedShortfall99 * 100,
      },
      riskAdjustedReturns: {
        treynorRatio: this.performance.sharpeRatio, // 간단히 샤프비율로 대체
        jensenAlpha: this.performance.alpha,
        informationRatio: this.performance.sharpeRatio * 0.8, // 추정값
      },
      drawdownAnalysis,
    };
  }

  private analyzeDrawdowns() {
    const equity = this.equity;
    const drawdowns: number[] = [];
    const drawdownDurations: number[] = [];

    let currentDrawdown = 0;
    let drawdownStart: number | null = null;
    let peak = this.result.config.initialCapital;

    for (let i = 0; i < equity.length; i++) {
      const value = equity[i].value;

      if (value > peak) {
        // 새로운 고점
        if (currentDrawdown < 0) {
          drawdowns.push(currentDrawdown);
          if (drawdownStart !== null) {
            drawdownDurations.push(i - drawdownStart);
          }
        }
        peak = value;
        currentDrawdown = 0;
        drawdownStart = null;
      } else {
        // 드로우다운 중
        currentDrawdown = ((value - peak) / peak) * 100;
        if (drawdownStart === null) {
          drawdownStart = i;
        }
      }
    }

    const avgDrawdown =
      drawdowns.length > 0 ? drawdowns.reduce((sum, dd) => sum + dd, 0) / drawdowns.length : 0;

    return {
      maxDrawdown: this.performance.maxDrawdown,
      maxDrawdownDuration: this.performance.maxDrawdownDuration,
      avgDrawdown,
      recoveryTime:
        drawdownDurations.length > 0
          ? drawdownDurations.reduce((sum, dur) => sum + dur, 0) / drawdownDurations.length
          : 0,
      drawdownFrequency: (drawdowns.length / equity.length) * 100,
    };
  }

  private analyzeTradePatterns(): TradeAnalysis {
    const trades = this.trades.filter((t) => t.pnl !== undefined);

    const profits = trades.filter((t) => t.pnl && t.pnl > 0).map((t) => t.pnl!);
    const losses = trades.filter((t) => t.pnl && t.pnl < 0).map((t) => t.pnl!);
    const breakeven = trades.filter((t) => t.pnl === 0).length;

    // 연속 승/패 분석
    const consecutiveAnalysis = this.analyzeConsecutiveTrades(trades);

    // 월별 승률 분석
    const monthlyWinRate = this.analyzeMonthlyWinRate(trades);

    return {
      profitDistribution: {
        profits,
        losses,
        breakeven,
      },
      tradeDuration: {
        avgHoldingPeriod: 0, // 추후 구현
        maxHoldingPeriod: 0,
        minHoldingPeriod: 0,
      },
      tradeTiming: {
        monthlyWinRate,
        weeklyWinRate: {}, // 추후 구현
        bestTradingMonth: this.getBestMonth(monthlyWinRate),
        worstTradingMonth: this.getWorstMonth(monthlyWinRate),
      },
      consecutiveAnalysis,
    };
  }

  private analyzeConsecutiveTrades(trades: Trade[]) {
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let winStreaks: number[] = [];
    let lossStreaks: number[] = [];

    for (const trade of trades) {
      if (trade.pnl && trade.pnl > 0) {
        consecutiveWins++;
        if (consecutiveLosses > 0) {
          lossStreaks.push(consecutiveLosses);
          consecutiveLosses = 0;
        }
      } else if (trade.pnl && trade.pnl < 0) {
        consecutiveLosses++;
        if (consecutiveWins > 0) {
          winStreaks.push(consecutiveWins);
          consecutiveWins = 0;
        }
      }

      maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
    }

    // 마지막 연속 기록 추가
    if (consecutiveWins > 0) winStreaks.push(consecutiveWins);
    if (consecutiveLosses > 0) lossStreaks.push(consecutiveLosses);

    return {
      maxConsecutiveWins,
      maxConsecutiveLosses,
      avgConsecutiveWins:
        winStreaks.length > 0
          ? winStreaks.reduce((sum, streak) => sum + streak, 0) / winStreaks.length
          : 0,
      avgConsecutiveLosses:
        lossStreaks.length > 0
          ? lossStreaks.reduce((sum, streak) => sum + streak, 0) / lossStreaks.length
          : 0,
    };
  }

  private analyzeMonthlyWinRate(trades: Trade[]): Record<string, number> {
    const monthlyStats: Record<string, { wins: number; total: number }> = {};

    trades.forEach((trade) => {
      const month = trade.date.toISOString().slice(0, 7); // YYYY-MM

      if (!monthlyStats[month]) {
        monthlyStats[month] = { wins: 0, total: 0 };
      }

      monthlyStats[month].total++;
      if (trade.pnl && trade.pnl > 0) {
        monthlyStats[month].wins++;
      }
    });

    const monthlyWinRate: Record<string, number> = {};
    Object.entries(monthlyStats).forEach(([month, stats]) => {
      monthlyWinRate[month] = (stats.wins / stats.total) * 100;
    });

    return monthlyWinRate;
  }

  private getBestMonth(monthlyWinRate: Record<string, number>): string {
    let bestMonth = '';
    let bestRate = -1;

    Object.entries(monthlyWinRate).forEach(([month, rate]) => {
      if (rate > bestRate) {
        bestRate = rate;
        bestMonth = month;
      }
    });

    return bestMonth;
  }

  private getWorstMonth(monthlyWinRate: Record<string, number>): string {
    let worstMonth = '';
    let worstRate = 101;

    Object.entries(monthlyWinRate).forEach(([month, rate]) => {
      if (rate < worstRate) {
        worstRate = rate;
        worstMonth = month;
      }
    });

    return worstMonth;
  }

  private analyzePeriods(): PeriodAnalysis[] {
    const periods: PeriodAnalysis[] = [];
    const equity = this.equity;

    // 분기별 분석
    const quarterStarts = this.getQuarterStarts();

    quarterStarts.forEach((start, index) => {
      const end = quarterStarts[index + 1] || new Date(this.result.config.endDate);
      const periodEquity = equity.filter((e) => e.date >= start && e.date < end);

      if (periodEquity.length > 0) {
        const startValue = periodEquity[0].value;
        const endValue = periodEquity[periodEquity.length - 1].value;
        const periodReturn = ((endValue - startValue) / startValue) * 100;

        const periodReturns = this.calculateDailyReturns(periodEquity);
        const volatility = this.calculateVolatility(periodReturns);
        const maxDrawdown = Math.min(...periodEquity.map((e) => e.drawdown));

        const periodTrades = this.trades.filter((t) => t.date >= start && t.date < end);
        const winRate =
          periodTrades.length > 0
            ? (periodTrades.filter((t) => t.pnl !== undefined && t.pnl > 0).length /
                periodTrades.length) *
              100
            : 0;

        periods.push({
          period: `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`,
          startDate: start,
          endDate: end,
          return: periodReturn,
          volatility,
          maxDrawdown,
          trades: periodTrades.length,
          winRate,
        });
      }
    });

    return periods;
  }

  private getQuarterStarts(): Date[] {
    const start = new Date(this.result.config.startDate);
    const end = new Date(this.result.config.endDate);
    const quarters: Date[] = [];

    const current = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);

    while (current <= end) {
      quarters.push(new Date(current));
      current.setMonth(current.getMonth() + 3);
    }

    return quarters;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const performance = this.performance;

    // 수익률 기반 추천
    if (performance.totalReturn < 5) {
      recommendations.push('전략의 수익률이 낮습니다. 더 공격적인 전략을 고려해보세요.');
    } else if (performance.totalReturn > 30) {
      recommendations.push('높은 수익률을 달성했지만, 리스크 관리를 강화하는 것을 권장합니다.');
    }

    // 샤프 비율 기반 추천
    if (performance.sharpeRatio < 1) {
      recommendations.push('샤프 비율이 낮습니다. 리스크 대비 수익을 개선할 필요가 있습니다.');
    } else if (performance.sharpeRatio > 2) {
      recommendations.push(
        '우수한 샤프 비율입니다. 현재 전략을 유지하거나 포지션 크기를 늘려보세요.',
      );
    }

    // 최대 손실폭 기반 추천
    if (performance.maxDrawdown < -20) {
      recommendations.push('최대 손실폭이 큽니다. 포지션 크기를 줄이거나 손절 전략을 도입하세요.');
    }

    // 승률 기반 추천
    if (performance.winRate < 40) {
      recommendations.push('승률이 낮습니다. 진입 조건을 더 엄격하게 설정해보세요.');
    }

    // 거래 빈도 기반 추천
    if (performance.totalTrades < 10) {
      recommendations.push(
        '거래 빈도가 낮습니다. 더 많은 기회를 포착할 수 있도록 전략을 조정해보세요.',
      );
    } else if (performance.totalTrades > 100) {
      recommendations.push(
        '거래가 너무 빈번합니다. 거래 비용이 수익에 미치는 영향을 확인해보세요.',
      );
    }

    return recommendations;
  }

  private calculateDailyReturns(equity?: EquityPoint[]): number[] {
    const equityData = equity || this.equity;
    const returns: number[] = [];

    for (let i = 1; i < equityData.length; i++) {
      const dailyReturn = (equityData[i].value - equityData[i - 1].value) / equityData[i - 1].value;
      returns.push(dailyReturn);
    }

    return returns;
  }

  private calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252) * 100; // 연간 변동성을 퍼센트로
  }
}

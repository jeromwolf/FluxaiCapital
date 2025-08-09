// AI Strategy Recommendation Engine
// This simulates an AI-powered strategy recommendation system

export interface TradingStrategy {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  descriptionKr: string;
  type: 'momentum' | 'value' | 'growth' | 'dividend' | 'balanced' | 'defensive';
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number; // Annual percentage
  volatility: number; // Standard deviation
  sharpeRatio: number;
  recommendedHoldings: string[];
  allocation: Record<string, number>; // Symbol -> percentage
  confidence: number; // 0-100
  backtestResults?: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
  };
}

export interface MarketCondition {
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
  economicIndicators: {
    gdpGrowth: number;
    inflation: number;
    interestRate: number;
    unemployment: number;
  };
  sectorPerformance: Record<string, number>;
}

export interface UserProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: 'short' | 'medium' | 'long'; // <1y, 1-5y, >5y
  age: number;
  goalReturn: number; // Target annual return
  currentPortfolioValue: number;
  monthlyContribution: number;
}

export class AIStrategyEngine {
  // Predefined strategies
  private strategies: TradingStrategy[] = [
    {
      id: 'momentum-tech',
      name: 'Tech Momentum',
      nameKr: '기술주 모멘텀',
      description: 'Focus on high-growth technology stocks with strong momentum',
      descriptionKr: '강한 모멘텀을 가진 고성장 기술주 중심 전략',
      type: 'momentum',
      riskLevel: 'high',
      expectedReturn: 18.5,
      volatility: 22.3,
      sharpeRatio: 0.83,
      recommendedHoldings: ['NVDA', 'MSFT', 'GOOGL', '005930', '035420'],
      allocation: {
        NVDA: 25,
        MSFT: 20,
        GOOGL: 20,
        '005930': 20,
        '035420': 15,
      },
      confidence: 85,
      backtestResults: {
        totalReturn: 145.2,
        annualizedReturn: 28.3,
        maxDrawdown: -18.5,
        winRate: 62.5,
        avgWin: 3.2,
        avgLoss: -1.8,
      },
    },
    {
      id: 'value-dividend',
      name: 'Value & Dividend',
      nameKr: '가치 & 배당',
      description: 'Undervalued stocks with stable dividend yields',
      descriptionKr: '안정적인 배당수익률을 가진 저평가 종목',
      type: 'dividend',
      riskLevel: 'low',
      expectedReturn: 8.2,
      volatility: 9.8,
      sharpeRatio: 0.84,
      recommendedHoldings: ['005380', '000660', 'AAPL', 'JNJ', 'PG'],
      allocation: {
        '005380': 20,
        '000660': 20,
        AAPL: 20,
        JNJ: 20,
        PG: 20,
      },
      confidence: 78,
      backtestResults: {
        totalReturn: 42.8,
        annualizedReturn: 8.9,
        maxDrawdown: -8.2,
        winRate: 71.2,
        avgWin: 1.8,
        avgLoss: -0.9,
      },
    },
    {
      id: 'balanced-growth',
      name: 'Balanced Growth',
      nameKr: '균형 성장',
      description: 'Mix of growth and value stocks across sectors',
      descriptionKr: '섹터별 성장주와 가치주의 균형 포트폴리오',
      type: 'balanced',
      riskLevel: 'medium',
      expectedReturn: 12.5,
      volatility: 14.2,
      sharpeRatio: 0.88,
      recommendedHoldings: ['MSFT', '005930', 'GOOGL', '373220', 'JPM', '035720'],
      allocation: {
        MSFT: 18,
        '005930': 17,
        GOOGL: 16,
        '373220': 17,
        JPM: 16,
        '035720': 16,
      },
      confidence: 82,
    },
    {
      id: 'defensive-quality',
      name: 'Defensive Quality',
      nameKr: '방어적 우량주',
      description: 'High-quality companies with low volatility',
      descriptionKr: '낮은 변동성의 고품질 우량 기업',
      type: 'defensive',
      riskLevel: 'low',
      expectedReturn: 7.5,
      volatility: 8.2,
      sharpeRatio: 0.91,
      recommendedHoldings: ['JNJ', 'PG', 'KO', '207940', 'WMT'],
      allocation: {
        JNJ: 22,
        PG: 20,
        KO: 20,
        '207940': 20,
        WMT: 18,
      },
      confidence: 88,
    },
    {
      id: 'korean-growth',
      name: 'Korean Growth Leaders',
      nameKr: '한국 성장 리더',
      description: 'Focus on leading Korean growth companies',
      descriptionKr: '한국의 선도적인 성장 기업 중심',
      type: 'growth',
      riskLevel: 'medium',
      expectedReturn: 14.8,
      volatility: 18.5,
      sharpeRatio: 0.8,
      recommendedHoldings: ['005930', '000660', '035420', '035720', '373220', '207940'],
      allocation: {
        '005930': 20,
        '000660': 18,
        '035420': 17,
        '035720': 16,
        '373220': 15,
        '207940': 14,
      },
      confidence: 79,
    },
  ];

  // Analyze market conditions
  async analyzeMarketConditions(): Promise<MarketCondition> {
    // In a real implementation, this would analyze real market data
    return {
      trend: this.randomChoice(['bullish', 'bearish', 'neutral']),
      volatility: this.randomChoice(['low', 'medium', 'high']),
      economicIndicators: {
        gdpGrowth: 2.8,
        inflation: 3.2,
        interestRate: 5.25,
        unemployment: 3.7,
      },
      sectorPerformance: {
        technology: 12.5,
        healthcare: 8.2,
        finance: 6.8,
        consumer: 4.5,
        energy: -2.1,
        utilities: 3.2,
      },
    };
  }

  // Get personalized strategy recommendations
  async getRecommendations(
    userProfile: UserProfile,
    currentHoldings?: string[],
  ): Promise<TradingStrategy[]> {
    const marketConditions = await this.analyzeMarketConditions();

    // Filter strategies based on user profile
    let filteredStrategies = this.strategies.filter((strategy) => {
      // Risk matching
      if (userProfile.riskTolerance === 'conservative' && strategy.riskLevel === 'high') {
        return false;
      }
      if (userProfile.riskTolerance === 'aggressive' && strategy.riskLevel === 'low') {
        return false;
      }

      // Return expectations
      if (strategy.expectedReturn < userProfile.goalReturn * 0.7) {
        return false;
      }

      return true;
    });

    // Adjust confidence based on market conditions
    filteredStrategies = filteredStrategies.map((strategy) => {
      let confidence = strategy.confidence;

      // Adjust for market trend
      if (marketConditions.trend === 'bullish' && strategy.type === 'momentum') {
        confidence += 10;
      } else if (marketConditions.trend === 'bearish' && strategy.type === 'defensive') {
        confidence += 15;
      }

      // Adjust for volatility
      if (marketConditions.volatility === 'high' && strategy.riskLevel === 'low') {
        confidence += 5;
      }

      // Adjust for user's investment horizon
      if (userProfile.investmentHorizon === 'long' && strategy.type === 'growth') {
        confidence += 8;
      } else if (userProfile.investmentHorizon === 'short' && strategy.type === 'dividend') {
        confidence += 5;
      }

      return {
        ...strategy,
        confidence: Math.min(100, confidence),
      };
    });

    // Sort by confidence
    return filteredStrategies.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  // Generate AI insights
  async generateInsights(strategy: TradingStrategy, userProfile: UserProfile): Promise<string[]> {
    const insights: string[] = [];

    // Market condition insights
    const marketConditions = await this.analyzeMarketConditions();

    if (marketConditions.trend === 'bullish') {
      insights.push('현재 시장은 상승 추세를 보이고 있어 성장주 전략이 유리할 수 있습니다.');
    } else if (marketConditions.trend === 'bearish') {
      insights.push('시장이 하락 국면에 있어 방어적인 포지션이 권장됩니다.');
    }

    // Strategy-specific insights
    if (strategy.type === 'momentum') {
      insights.push('모멘텀 전략은 단기적으로 높은 수익을 낼 수 있지만 변동성이 큽니다.');
    } else if (strategy.type === 'dividend') {
      insights.push('배당주 전략은 안정적인 현금흐름을 제공하며 하락장에서 방어적입니다.');
    }

    // Risk insights
    if (strategy.volatility > 20) {
      insights.push('이 전략의 변동성이 높아 단기적으로 큰 손실을 볼 수 있습니다.');
    }

    // Performance insights
    if (strategy.backtestResults) {
      const { winRate, maxDrawdown } = strategy.backtestResults;
      insights.push(
        `과거 백테스트 결과 ${winRate}%의 승률과 최대 ${Math.abs(maxDrawdown)}%의 낙폭을 보였습니다.`,
      );
    }

    // Personalized insights
    if (userProfile.age > 50 && strategy.riskLevel === 'high') {
      insights.push('은퇴가 가까워질수록 보수적인 전략을 고려해보세요.');
    }

    return insights;
  }

  // Calculate portfolio optimization
  async optimizePortfolio(
    currentHoldings: { symbol: string; value: number }[],
    targetStrategy: TradingStrategy,
    constraints?: {
      maxPositionSize?: number;
      minPositionSize?: number;
      maxTransactions?: number;
    },
  ): Promise<{
    recommendations: Array<{
      action: 'buy' | 'sell' | 'hold';
      symbol: string;
      currentWeight: number;
      targetWeight: number;
      amount: number;
    }>;
    expectedImprovement: {
      return: number;
      risk: number;
      sharpeRatio: number;
    };
  }> {
    const totalValue = currentHoldings.reduce((sum, h) => sum + h.value, 0);
    const currentWeights: Record<string, number> = {};

    currentHoldings.forEach((h) => {
      currentWeights[h.symbol] = (h.value / totalValue) * 100;
    });

    const recommendations = [];

    // Calculate rebalancing recommendations
    for (const [symbol, targetWeight] of Object.entries(targetStrategy.allocation)) {
      const currentWeight = currentWeights[symbol] || 0;
      const diff = targetWeight - currentWeight;

      if (Math.abs(diff) > 2) {
        // Only rebalance if difference > 2%
        const action: 'buy' | 'sell' | 'hold' = diff > 0 ? 'buy' : 'sell';
        recommendations.push({
          action,
          symbol,
          currentWeight,
          targetWeight,
          amount: Math.abs((diff * totalValue) / 100),
        });
      }
    }

    // Sell positions not in target strategy
    for (const holding of currentHoldings) {
      if (!targetStrategy.allocation[holding.symbol]) {
        const action: 'buy' | 'sell' | 'hold' = 'sell';
        recommendations.push({
          action,
          symbol: holding.symbol,
          currentWeight: currentWeights[holding.symbol],
          targetWeight: 0,
          amount: holding.value,
        });
      }
    }

    return {
      recommendations: recommendations.sort((a, b) => b.amount - a.amount),
      expectedImprovement: {
        return: targetStrategy.expectedReturn - 10, // Placeholder
        risk: targetStrategy.volatility - 15, // Placeholder
        sharpeRatio: targetStrategy.sharpeRatio - 0.7, // Placeholder
      },
    };
  }

  private randomChoice<T>(choices: T[]): T {
    return choices[Math.floor(Math.random() * choices.length)];
  }
}

export const aiStrategy = new AIStrategyEngine();

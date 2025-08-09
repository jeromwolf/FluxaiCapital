import { SocialSentimentService } from '@/lib/social/social-sentiment-service';

interface StrategySignal {
  action: 'buy' | 'sell' | 'hold' | 'adjust';
  confidence: number; // 0-100
  reasoning: string[];
  suggestedPositionSize?: number; // As percentage
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
}

interface SentimentStrategyConfig {
  sentimentWeight: number; // 0-1, how much to weight sentiment vs other factors
  volumeThreshold: number; // Minimum tweet volume to consider
  confidenceThreshold: number; // Minimum confidence to act on
  extremeSentimentThreshold: number; // Threshold for extreme sentiment (e.g., 70)
  enableContrarian: boolean; // Enable contrarian signals
}

export class SentimentStrategyIntegration {
  private sentimentService: SocialSentimentService;
  private config: SentimentStrategyConfig;

  constructor(config?: Partial<SentimentStrategyConfig>) {
    this.sentimentService = new SocialSentimentService();
    this.config = {
      sentimentWeight: 0.3,
      volumeThreshold: 100,
      confidenceThreshold: 60,
      extremeSentimentThreshold: 70,
      enableContrarian: false,
      ...config,
    };
  }

  /**
   * Generate trading signal based on sentiment analysis
   */
  async generateSentimentSignal(
    symbol: string,
    currentPrice: number,
    technicalSignals?: {
      rsi?: number;
      macd?: { signal: 'buy' | 'sell' | 'neutral' };
      supportResistance?: { support: number; resistance: number };
    }
  ): Promise<StrategySignal> {
    try {
      // Get sentiment data
      const sentimentData = await this.sentimentService.getStockSentiment(symbol);
      
      // Check if we have enough data
      if (sentimentData.metrics.tweetVolume < this.config.volumeThreshold) {
        return {
          action: 'hold',
          confidence: 30,
          reasoning: ['Insufficient social media volume for reliable sentiment analysis'],
          riskLevel: 'low',
          timeHorizon: 'short',
        };
      }

      if (sentimentData.sentiment.confidence < this.config.confidenceThreshold) {
        return {
          action: 'hold',
          confidence: 40,
          reasoning: ['Low confidence in sentiment analysis'],
          riskLevel: 'low',
          timeHorizon: 'short',
        };
      }

      // Analyze sentiment trends
      const sentimentTrend = this.analyzeSentimentTrend(sentimentData.trends.hourly);
      const volumeTrend = this.analyzeVolumeTrend(sentimentData.trends.hourly);

      // Initialize signal components
      let action: 'buy' | 'sell' | 'hold' | 'adjust' = 'hold';
      let confidence = 50;
      const reasoning: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      let timeHorizon: 'short' | 'medium' | 'long' = 'short';

      // Extreme sentiment analysis
      const extremeSentiment = Math.abs(sentimentData.sentiment.score) > this.config.extremeSentimentThreshold;
      
      if (extremeSentiment) {
        if (this.config.enableContrarian) {
          // Contrarian approach - fade extreme sentiment
          if (sentimentData.sentiment.score > this.config.extremeSentimentThreshold) {
            action = 'sell';
            reasoning.push('Extreme bullish sentiment - contrarian sell signal');
            riskLevel = 'high';
          } else if (sentimentData.sentiment.score < -this.config.extremeSentimentThreshold) {
            action = 'buy';
            reasoning.push('Extreme bearish sentiment - contrarian buy signal');
            riskLevel = 'high';
          }
        } else {
          // Momentum approach - follow extreme sentiment
          if (sentimentData.sentiment.score > this.config.extremeSentimentThreshold) {
            action = 'buy';
            reasoning.push('Strong bullish sentiment momentum');
          } else if (sentimentData.sentiment.score < -this.config.extremeSentimentThreshold) {
            action = 'sell';
            reasoning.push('Strong bearish sentiment momentum');
          }
        }
        confidence = Math.min(90, sentimentData.sentiment.confidence);
      }

      // Sentiment trend analysis
      if (sentimentTrend.improving && sentimentData.sentiment.score > 20) {
        if (action === 'hold') action = 'buy';
        confidence = Math.max(confidence, 70);
        reasoning.push('Improving sentiment trend with positive bias');
        timeHorizon = 'medium';
      } else if (sentimentTrend.deteriorating && sentimentData.sentiment.score < -20) {
        if (action === 'hold') action = 'sell';
        confidence = Math.max(confidence, 70);
        reasoning.push('Deteriorating sentiment trend with negative bias');
        timeHorizon = 'short';
      }

      // Volume spike analysis
      if (volumeTrend.spiking) {
        confidence += 10;
        reasoning.push('Significant volume spike detected');
        if (sentimentData.sentiment.score > 0 && action === 'hold') {
          action = 'buy';
        } else if (sentimentData.sentiment.score < 0 && action === 'hold') {
          action = 'sell';
        }
      }

      // High influencer activity
      if (sentimentData.metrics.influencerActivity > 50) {
        confidence += 5;
        reasoning.push('High influencer activity detected');
        riskLevel = 'high'; // Higher risk due to potential manipulation
      }

      // Combine with technical signals if available
      if (technicalSignals) {
        const combinedSignal = this.combineWithTechnicalSignals(
          { action, confidence, reasoning, riskLevel, timeHorizon },
          technicalSignals,
          sentimentData
        );
        return combinedSignal;
      }

      // Calculate suggested position size based on confidence and risk
      const suggestedPositionSize = this.calculatePositionSize(confidence, riskLevel);

      return {
        action,
        confidence: Math.min(100, confidence),
        reasoning,
        suggestedPositionSize,
        riskLevel,
        timeHorizon,
      };
    } catch (error) {
      console.error('Error generating sentiment signal:', error);
      return {
        action: 'hold',
        confidence: 0,
        reasoning: ['Error analyzing sentiment data'],
        riskLevel: 'low',
        timeHorizon: 'short',
      };
    }
  }

  /**
   * Generate portfolio-wide sentiment adjustments
   */
  async generatePortfolioAdjustments(
    portfolio: Array<{ symbol: string; currentWeight: number; currentValue: number }>
  ): Promise<Array<{
    symbol: string;
    currentWeight: number;
    suggestedWeight: number;
    action: 'increase' | 'decrease' | 'maintain';
    reason: string;
  }>> {
    const adjustments = [];

    // Get market sentiment
    const marketSentiment = await this.sentimentService.getMarketSentiment();
    
    // Analyze each position
    for (const position of portfolio) {
      try {
        const sentimentData = await this.sentimentService.getStockSentiment(position.symbol);
        
        let suggestedWeight = position.currentWeight;
        let action: 'increase' | 'decrease' | 'maintain' = 'maintain';
        let reason = '';

        // Individual stock sentiment
        if (sentimentData.sentiment.score > 50 && sentimentData.sentiment.confidence > 70) {
          suggestedWeight = position.currentWeight * 1.15;
          action = 'increase';
          reason = 'Strong positive sentiment';
        } else if (sentimentData.sentiment.score < -50 && sentimentData.sentiment.confidence > 70) {
          suggestedWeight = position.currentWeight * 0.85;
          action = 'decrease';
          reason = 'Strong negative sentiment';
        }

        // Market sentiment overlay
        if (marketSentiment.overall.sentiment === 'bearish' && marketSentiment.overall.score < -30) {
          suggestedWeight *= 0.9;
          reason += '; Bearish market sentiment';
          if (action === 'maintain') action = 'decrease';
        } else if (marketSentiment.overall.sentiment === 'bullish' && marketSentiment.overall.score > 30) {
          suggestedWeight *= 1.05;
          reason += '; Bullish market sentiment';
          if (action === 'maintain') action = 'increase';
        }

        // Sentiment momentum
        const sentimentTrend = this.analyzeSentimentTrend(sentimentData.trends.daily);
        if (sentimentTrend.improving && sentimentTrend.changeRate > 20) {
          suggestedWeight *= 1.05;
          reason += '; Improving sentiment momentum';
        } else if (sentimentTrend.deteriorating && sentimentTrend.changeRate < -20) {
          suggestedWeight *= 0.95;
          reason += '; Deteriorating sentiment momentum';
        }

        // Cap adjustments
        suggestedWeight = Math.max(0, Math.min(100, suggestedWeight));

        if (suggestedWeight !== position.currentWeight) {
          adjustments.push({
            symbol: position.symbol,
            currentWeight: position.currentWeight,
            suggestedWeight: Number(suggestedWeight.toFixed(2)),
            action,
            reason: reason.trim(),
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${position.symbol}:`, error);
      }
    }

    // Normalize weights to sum to 100%
    const totalSuggestedWeight = adjustments.reduce((sum, adj) => sum + adj.suggestedWeight, 0) +
      portfolio.filter(p => !adjustments.find(a => a.symbol === p.symbol))
        .reduce((sum, p) => sum + p.currentWeight, 0);

    if (totalSuggestedWeight > 0) {
      adjustments.forEach(adj => {
        adj.suggestedWeight = (adj.suggestedWeight / totalSuggestedWeight) * 100;
      });
    }

    return adjustments;
  }

  /**
   * Detect sentiment-based market regime
   */
  async detectMarketRegime(): Promise<{
    regime: 'risk-on' | 'risk-off' | 'neutral';
    confidence: number;
    indicators: string[];
  }> {
    try {
      const marketSentiment = await this.sentimentService.getMarketSentiment();
      
      let regime: 'risk-on' | 'risk-off' | 'neutral' = 'neutral';
      let confidence = 50;
      const indicators: string[] = [];

      // Overall market sentiment
      if (marketSentiment.overall.score > 30) {
        regime = 'risk-on';
        confidence = 70;
        indicators.push('Bullish market sentiment');
      } else if (marketSentiment.overall.score < -30) {
        regime = 'risk-off';
        confidence = 70;
        indicators.push('Bearish market sentiment');
      }

      // Sector rotation analysis
      const sectorSentiments = Object.entries(marketSentiment.sectors)
        .map(([sector, data]) => ({ sector, sentiment: data.sentiment }))
        .sort((a, b) => b.sentiment - a.sentiment);

      const topSectors = sectorSentiments.slice(0, 2).map(s => s.sector);
      const bottomSectors = sectorSentiments.slice(-2).map(s => s.sector);

      if (topSectors.includes('tech') && topSectors.includes('consumer')) {
        regime = 'risk-on';
        confidence = Math.min(90, confidence + 20);
        indicators.push('Risk-on sectors leading');
      } else if (bottomSectors.includes('tech') && topSectors.includes('utilities')) {
        regime = 'risk-off';
        confidence = Math.min(90, confidence + 20);
        indicators.push('Defensive sectors outperforming');
      }

      // Trending topics analysis
      const fearTopics = marketSentiment.trendingTopics.filter(t => 
        t.topic.toLowerCase().includes('crash') || 
        t.topic.toLowerCase().includes('recession') ||
        t.topic.toLowerCase().includes('bear')
      );

      const greedTopics = marketSentiment.trendingTopics.filter(t => 
        t.topic.toLowerCase().includes('bull') || 
        t.topic.toLowerCase().includes('moon') ||
        t.topic.toLowerCase().includes('rally')
      );

      if (fearTopics.length > greedTopics.length) {
        if (regime !== 'risk-off') confidence -= 10;
        regime = 'risk-off';
        indicators.push('Fear-related topics trending');
      } else if (greedTopics.length > fearTopics.length) {
        if (regime !== 'risk-on') confidence -= 10;
        regime = 'risk-on';
        indicators.push('Greed-related topics trending');
      }

      // Momentum indicator
      if (marketSentiment.overall.momentum === 'increasing' && regime === 'risk-on') {
        confidence += 10;
        indicators.push('Positive momentum increasing');
      } else if (marketSentiment.overall.momentum === 'decreasing' && regime === 'risk-off') {
        confidence += 10;
        indicators.push('Negative momentum increasing');
      }

      return {
        regime,
        confidence: Math.min(100, Math.max(0, confidence)),
        indicators,
      };
    } catch (error) {
      console.error('Error detecting market regime:', error);
      return {
        regime: 'neutral',
        confidence: 0,
        indicators: ['Error analyzing market sentiment'],
      };
    }
  }

  /**
   * Analyze sentiment trend
   */
  private analyzeSentimentTrend(
    data: Array<{ time: string; sentiment: number }>
  ): {
    improving: boolean;
    deteriorating: boolean;
    stable: boolean;
    changeRate: number;
  } {
    if (data.length < 3) {
      return { improving: false, deteriorating: false, stable: true, changeRate: 0 };
    }

    const recent = data.slice(-3).map(d => d.sentiment);
    const older = data.slice(-6, -3).map(d => d.sentiment);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    const changeRate = recentAvg - olderAvg;

    return {
      improving: changeRate > 10,
      deteriorating: changeRate < -10,
      stable: Math.abs(changeRate) <= 10,
      changeRate,
    };
  }

  /**
   * Analyze volume trend
   */
  private analyzeVolumeTrend(
    data: Array<{ time: string; volume: number }>
  ): {
    spiking: boolean;
    declining: boolean;
    averageVolume: number;
  } {
    if (data.length < 3) {
      return { spiking: false, declining: false, averageVolume: 0 };
    }

    const volumes = data.map(d => d.volume);
    const averageVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const latestVolume = volumes[volumes.length - 1];

    return {
      spiking: latestVolume > averageVolume * 2,
      declining: latestVolume < averageVolume * 0.5,
      averageVolume,
    };
  }

  /**
   * Combine sentiment signals with technical indicators
   */
  private combineWithTechnicalSignals(
    sentimentSignal: StrategySignal,
    technicalSignals: any,
    sentimentData: any
  ): StrategySignal {
    let { action, confidence, reasoning, riskLevel, timeHorizon } = sentimentSignal;

    // RSI confirmation
    if (technicalSignals.rsi !== undefined) {
      if (technicalSignals.rsi > 70 && sentimentData.sentiment.score > 50) {
        reasoning.push('Overbought RSI with bullish sentiment - potential reversal');
        if (this.config.enableContrarian) {
          action = 'sell';
          riskLevel = 'high';
        }
      } else if (technicalSignals.rsi < 30 && sentimentData.sentiment.score < -50) {
        reasoning.push('Oversold RSI with bearish sentiment - potential bounce');
        if (this.config.enableContrarian) {
          action = 'buy';
          riskLevel = 'high';
        }
      }
    }

    // MACD confirmation
    if (technicalSignals.macd) {
      if (technicalSignals.macd.signal === 'buy' && action === 'buy') {
        confidence += 15;
        reasoning.push('MACD confirms bullish sentiment');
      } else if (technicalSignals.macd.signal === 'sell' && action === 'sell') {
        confidence += 15;
        reasoning.push('MACD confirms bearish sentiment');
      } else if (
        (technicalSignals.macd.signal === 'buy' && action === 'sell') ||
        (technicalSignals.macd.signal === 'sell' && action === 'buy')
      ) {
        confidence -= 10;
        reasoning.push('MACD diverges from sentiment - caution advised');
        riskLevel = 'high';
      }
    }

    const suggestedPositionSize = this.calculatePositionSize(confidence, riskLevel);

    return {
      action,
      confidence: Math.min(100, Math.max(0, confidence)),
      reasoning,
      suggestedPositionSize,
      riskLevel,
      timeHorizon,
    };
  }

  /**
   * Calculate position size based on confidence and risk
   */
  private calculatePositionSize(confidence: number, riskLevel: string): number {
    const baseSize = 5; // Base position size as percentage
    
    let multiplier = confidence / 100;
    
    switch (riskLevel) {
      case 'low':
        multiplier *= 1.2;
        break;
      case 'medium':
        multiplier *= 1.0;
        break;
      case 'high':
        multiplier *= 0.7;
        break;
    }

    return Math.min(20, Math.max(1, baseSize * multiplier));
  }

  /**
   * Update strategy configuration
   */
  updateConfig(config: Partial<SentimentStrategyConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
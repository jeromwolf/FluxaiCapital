import { BaseStrategy } from './base';
import { MarketData, Signal } from '../types';

export class MovingAverageStrategy extends BaseStrategy {
  private priceHistory: Map<string, number[]> = new Map();

  constructor(parameters: {
    fastPeriod?: number;
    slowPeriod?: number;
    type?: 'sma' | 'ema';
  } = {}) {
    super(
      'Moving Average',
      '이동평균선 교차를 기반으로 한 매매 전략',
      {
        fastPeriod: 20,
        slowPeriod: 50,
        type: 'sma',
        ...parameters,
      }
    );
  }

  generateSignals(data: MarketData[], holdings: Map<string, number>): Signal[] {
    const signals: Signal[] = [];

    for (const marketData of data) {
      const symbol = marketData.symbol;
      
      // 가격 이력 업데이트
      if (!this.priceHistory.has(symbol)) {
        this.priceHistory.set(symbol, []);
      }
      
      const prices = this.priceHistory.get(symbol)!;
      prices.push(marketData.close);

      // 충분한 데이터가 있을 때만 시그널 생성
      if (prices.length >= this.parameters.slowPeriod) {
        const signal = this.checkCrossover(marketData, prices, holdings.get(symbol) || 0);
        if (signal) {
          signals.push(signal);
        }
      }
    }

    return signals;
  }

  private checkCrossover(marketData: MarketData, prices: number[], currentPosition: number): Signal | null {
    const { fastPeriod, slowPeriod, type } = this.parameters;

    // 이동평균 계산
    let fastMA: number[];
    let slowMA: number[];

    if (type === 'ema') {
      fastMA = this.calculateEMA(prices, fastPeriod);
      slowMA = this.calculateEMA(prices, slowPeriod);
    } else {
      fastMA = this.calculateSMA(prices, fastPeriod);
      slowMA = this.calculateSMA(prices, slowPeriod);
    }

    // 최소 2개의 이동평균 값이 필요 (교차 확인을 위해)
    if (fastMA.length < 2 || slowMA.length < 2) {
      return null;
    }

    const currentFast = fastMA[fastMA.length - 1];
    const currentSlow = slowMA[slowMA.length - 1];
    const prevFast = fastMA[fastMA.length - 2];
    const prevSlow = slowMA[slowMA.length - 2];

    // 골든 크로스 (상승 시그널)
    if (prevFast <= prevSlow && currentFast > currentSlow && currentPosition === 0) {
      return this.createSignal(
        marketData.date,
        marketData.symbol,
        'buy',
        undefined,
        this.calculateConfidence(currentFast, currentSlow, prices),
        `골든 크로스: Fast MA(${fastPeriod}) > Slow MA(${slowPeriod})`
      );
    }

    // 데드 크로스 (하락 시그널)
    if (prevFast >= prevSlow && currentFast < currentSlow && currentPosition > 0) {
      return this.createSignal(
        marketData.date,
        marketData.symbol,
        'sell',
        currentPosition,
        this.calculateConfidence(currentSlow, currentFast, prices),
        `데드 크로스: Fast MA(${fastPeriod}) < Slow MA(${slowPeriod})`
      );
    }

    return null;
  }

  private calculateConfidence(higher: number, lower: number, prices: number[]): number {
    // 이동평균 간격이 클수록, 최근 가격 움직임이 일관될수록 신뢰도 높음
    const spread = Math.abs(higher - lower) / lower;
    const recentPrices = prices.slice(-10); // 최근 10일
    const volatility = this.calculateVolatility(recentPrices);
    
    // 스프레드는 높을수록, 변동성은 낮을수록 좋음
    const confidence = Math.min(spread * 10, 0.5) + Math.max(0, 0.5 - volatility);
    return Math.min(Math.max(confidence, 0.1), 1.0);
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  reset(): void {
    this.priceHistory.clear();
  }
}
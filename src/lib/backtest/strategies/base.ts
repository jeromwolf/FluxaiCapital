import { MarketData, Signal } from '../types';

export abstract class BaseStrategy {
  protected name: string;
  protected description: string;
  protected parameters: Record<string, any>;

  constructor(name: string, description: string, parameters: Record<string, any> = {}) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  abstract generateSignals(data: MarketData[], holdings: Map<string, number>): Signal[];

  protected createSignal(
    date: Date,
    symbol: string,
    action: 'buy' | 'sell' | 'hold',
    quantity?: number,
    confidence?: number,
    reason?: string,
  ): Signal {
    return {
      date,
      symbol,
      action,
      quantity,
      confidence,
      reason,
    };
  }

  protected calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];

    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }

    return sma;
  }

  protected calculateEMA(prices: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    // 첫 번째 EMA는 SMA로 계산
    const firstSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);

    // 나머지 EMA 계산
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(currentEMA);
    }

    return ema;
  }

  protected calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // 첫 번째 gain과 loss 계산
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // RSI 계산
    for (let i = period - 1; i < gains.length; i++) {
      let avgGain: number;
      let avgLoss: number;

      if (i === period - 1) {
        avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      } else {
        avgGain = (rsi[i - period] * (period - 1) + gains[i]) / period;
        avgLoss = (rsi[i - period] * (period - 1) + losses[i]) / period;
      }

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }

    return rsi;
  }

  protected calculateBollingerBands(
    prices: number[],
    period: number = 20,
    multiplier: number = 2,
  ): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);

      upper.push(mean + stdDev * multiplier);
      lower.push(mean - stdDev * multiplier);
    }

    return { upper, middle, lower };
  }

  protected calculateMACD(
    prices: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
  ): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);

    // MACD Line = Fast EMA - Slow EMA
    const macd: number[] = [];
    const startIndex = slowPeriod - fastPeriod;

    for (let i = 0; i < slowEMA.length; i++) {
      macd.push(fastEMA[i + startIndex] - slowEMA[i]);
    }

    // Signal Line = EMA of MACD
    const signal = this.calculateEMA(macd, signalPeriod);

    // Histogram = MACD - Signal
    const histogram: number[] = [];
    const histStartIndex = signalPeriod - 1;

    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[i + histStartIndex] - signal[i]);
    }

    return { macd, signal, histogram };
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getParameters(): Record<string, any> {
    return this.parameters;
  }

  setParameters(parameters: Record<string, any>): void {
    this.parameters = { ...this.parameters, ...parameters };
  }
}

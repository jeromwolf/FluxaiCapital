import { MarketCandle } from '@/lib/market/types';

// Chart types and timeframes
export type ChartType = 'candlestick' | 'line' | 'bar' | 'area' | 'heikinashi';
export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Technical indicator types
export type IndicatorType =
  | 'MA'
  | 'EMA'
  | 'RSI'
  | 'MACD'
  | 'BB'
  | 'VOLUME'
  | 'SMA'
  | 'WMA'
  | 'STOCH'
  | 'ATR';

// Drawing tool types
export type DrawingTool = 'trend' | 'horizontal' | 'vertical' | 'fib' | 'rect' | 'text' | 'arrow';

// Chart pattern types
export type ChartPattern =
  | 'double-top'
  | 'double-bottom'
  | 'head-shoulders'
  | 'inverse-head-shoulders'
  | 'triangle-ascending'
  | 'triangle-descending'
  | 'triangle-symmetrical'
  | 'wedge-rising'
  | 'wedge-falling'
  | 'flag'
  | 'pennant';

// Interfaces
export interface ChartPoint {
  x: number; // timestamp
  y: number; // price
}

export interface ChartDrawing {
  id: string;
  type: DrawingTool;
  points: ChartPoint[];
  color?: string;
  lineWidth?: number;
  text?: string;
  levels?: number[]; // For fibonacci
}

export interface IndicatorConfig {
  type: IndicatorType;
  enabled: boolean;
  period?: number;
  color?: string;
  lineWidth?: number;
  // Specific indicator params
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  standardDeviations?: number; // For Bollinger Bands
  overbought?: number; // For RSI
  oversold?: number; // For RSI
}

export interface ChartConfig {
  type: ChartType;
  timeframe: TimeFrame;
  indicators: Map<string, IndicatorConfig>;
  drawings: ChartDrawing[];
  showVolume: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  autoScale: boolean;
  logScale: boolean;
}

// Technical Analysis Calculations
export class TechnicalIndicators {
  // Simple Moving Average
  static SMA(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }

    return result;
  }

  // Exponential Moving Average
  static EMA(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    const multiplier = 2 / (period + 1);

    // First EMA is SMA
    const sma = this.SMA(data.slice(0, period), period);
    const firstSMA = sma[period - 1];
    if (firstSMA === null || firstSMA === undefined) return result;

    result.push(...new Array(period - 1).fill(null));
    result.push(firstSMA);

    for (let i = period; i < data.length; i++) {
      const prevEMA = result[i - 1];
      if (prevEMA !== null && prevEMA !== undefined) {
        const ema = (data[i] - prevEMA) * multiplier + prevEMA;
        result.push(ema);
      } else {
        result.push(null);
      }
    }

    return result;
  }

  // Weighted Moving Average
  static WMA(data: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    const weightSum = (period * (period + 1)) / 2;

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        let weightedSum = 0;
        for (let j = 0; j < period; j++) {
          weightedSum += data[i - j] * (period - j);
        }
        result.push(weightedSum / weightSum);
      }
    }

    return result;
  }

  // Relative Strength Index
  static RSI(data: number[], period: number = 14): (number | null)[] {
    const result: (number | null)[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }

    // Not enough data
    if (gains.length < period) {
      return new Array(data.length).fill(null);
    }

    // First RSI calculation
    result.push(null); // First data point has no RSI

    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      result.push(rsi);
    }

    // Fill initial nulls
    while (result.length < data.length) {
      result.unshift(null);
    }

    return result;
  }

  // MACD (Moving Average Convergence Divergence)
  static MACD(
    data: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
  ): {
    macd: (number | null)[];
    signal: (number | null)[];
    histogram: (number | null)[];
  } {
    const fastEMA = this.EMA(data, fastPeriod);
    const slowEMA = this.EMA(data, slowPeriod);

    const macd: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (
        fastEMA[i] !== null &&
        fastEMA[i] !== undefined &&
        slowEMA[i] !== null &&
        slowEMA[i] !== undefined
      ) {
        macd.push((fastEMA[i] as number) - (slowEMA[i] as number));
      } else {
        macd.push(null);
      }
    }

    const signal = this.EMA(macd.filter((v) => v !== null) as number[], signalPeriod);
    const paddedSignal: (number | null)[] = [
      ...new Array(data.length - signal.length).fill(null),
      ...signal,
    ];

    const histogram: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (
        macd[i] !== null &&
        macd[i] !== undefined &&
        paddedSignal[i] !== null &&
        paddedSignal[i] !== undefined
      ) {
        histogram.push((macd[i] as number) - (paddedSignal[i] as number));
      } else {
        histogram.push(null);
      }
    }

    return { macd, signal: paddedSignal, histogram };
  }

  // Bollinger Bands
  static BollingerBands(
    data: number[],
    period: number = 20,
    standardDeviations: number = 2,
  ): {
    upper: (number | null)[];
    middle: (number | null)[];
    lower: (number | null)[];
  } {
    const middle = this.SMA(data, period);
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1 || middle[i] === null || middle[i] === undefined) {
        upper.push(null);
        lower.push(null);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = middle[i] as number;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        upper.push(mean + standardDeviations * stdDev);
        lower.push(mean - standardDeviations * stdDev);
      }
    }

    return { upper, middle, lower };
  }

  // Stochastic Oscillator
  static Stochastic(
    high: number[],
    low: number[],
    close: number[],
    period: number = 14,
    smoothK: number = 3,
    smoothD: number = 3,
  ): {
    k: (number | null)[];
    d: (number | null)[];
  } {
    const k: (number | null)[] = [];

    for (let i = 0; i < close.length; i++) {
      if (i < period - 1) {
        k.push(null);
      } else {
        const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
        const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
        const currentClose = close[i];

        if (highestHigh === lowestLow) {
          k.push(50); // Middle value when range is 0
        } else {
          k.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100);
        }
      }
    }

    // Smooth %K
    const smoothedK = this.SMA(k.filter((v) => v !== null) as number[], smoothK);
    const paddedK = [...new Array(close.length - smoothedK.length).fill(null), ...smoothedK];

    // %D is SMA of %K
    const d = this.SMA(paddedK.filter((v) => v !== null) as number[], smoothD);
    const paddedD = [...new Array(close.length - d.length).fill(null), ...d];

    return { k: paddedK, d: paddedD };
  }

  // Average True Range
  static ATR(
    high: number[],
    low: number[],
    close: number[],
    period: number = 14,
  ): (number | null)[] {
    const tr: number[] = [];

    // Calculate True Range
    for (let i = 0; i < high.length; i++) {
      if (i === 0) {
        tr.push(high[i] - low[i]);
      } else {
        const highLow = high[i] - low[i];
        const highClose = Math.abs(high[i] - close[i - 1]);
        const lowClose = Math.abs(low[i] - close[i - 1]);
        tr.push(Math.max(highLow, highClose, lowClose));
      }
    }

    // Calculate ATR as EMA of TR
    return this.EMA(tr, period);
  }
}

// Chart Pattern Recognition
export class PatternRecognition {
  static findPatterns(candles: MarketCandle[]): Array<{
    pattern: ChartPattern;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> {
    const patterns: Array<{
      pattern: ChartPattern;
      startIndex: number;
      endIndex: number;
      confidence: number;
    }> = [];

    // Check for various patterns
    patterns.push(...this.findDoubleTopBottom(candles));
    patterns.push(...this.findHeadAndShoulders(candles));
    patterns.push(...this.findTriangles(candles));
    patterns.push(...this.findWedges(candles));

    return patterns;
  }

  private static findDoubleTopBottom(candles: MarketCandle[]): Array<{
    pattern: ChartPattern;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> {
    const patterns: Array<{
      pattern: ChartPattern;
      startIndex: number;
      endIndex: number;
      confidence: number;
    }> = [];

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);

    // Look for double tops
    for (let i = 20; i < candles.length - 20; i++) {
      // Find first peak
      if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1]) {
        // Look for second peak within next 20 candles
        for (let j = i + 10; j < Math.min(i + 30, candles.length - 1); j++) {
          if (highs[j] > highs[j - 1] && highs[j] > highs[j + 1]) {
            // Check if peaks are similar height (within 2%)
            const diff = Math.abs(highs[i] - highs[j]) / highs[i];
            if (diff < 0.02) {
              // Check for valley between peaks
              const valleyIndex =
                lows
                  .slice(i, j)
                  .reduce((minIdx, val, idx) => (val < lows[i + minIdx] ? idx : minIdx), 0) + i;

              if (lows[valleyIndex] < highs[i] * 0.95) {
                patterns.push({
                  pattern: 'double-top',
                  startIndex: i - 5,
                  endIndex: j + 5,
                  confidence: 0.7 + 0.3 * (1 - diff),
                });
              }
            }
          }
        }
      }
    }

    // Look for double bottoms (similar logic, inverted)
    for (let i = 20; i < candles.length - 20; i++) {
      if (lows[i] < lows[i - 1] && lows[i] < lows[i + 1]) {
        for (let j = i + 10; j < Math.min(i + 30, candles.length - 1); j++) {
          if (lows[j] < lows[j - 1] && lows[j] < lows[j + 1]) {
            const diff = Math.abs(lows[i] - lows[j]) / lows[i];
            if (diff < 0.02) {
              const peakIndex =
                highs
                  .slice(i, j)
                  .reduce((maxIdx, val, idx) => (val > highs[i + maxIdx] ? idx : maxIdx), 0) + i;

              if (highs[peakIndex] > lows[i] * 1.05) {
                patterns.push({
                  pattern: 'double-bottom',
                  startIndex: i - 5,
                  endIndex: j + 5,
                  confidence: 0.7 + 0.3 * (1 - diff),
                });
              }
            }
          }
        }
      }
    }

    return patterns;
  }

  private static findHeadAndShoulders(_candles: MarketCandle[]): Array<{
    pattern: ChartPattern;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> {
    // Simplified implementation - would need more sophisticated logic in production
    return [];
  }

  private static findTriangles(_candles: MarketCandle[]): Array<{
    pattern: ChartPattern;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> {
    // Simplified implementation - would need more sophisticated logic in production
    return [];
  }

  private static findWedges(_candles: MarketCandle[]): Array<{
    pattern: ChartPattern;
    startIndex: number;
    endIndex: number;
    confidence: number;
  }> {
    // Simplified implementation - would need more sophisticated logic in production
    return [];
  }
}

// Fibonacci calculations
export class FibonacciLevels {
  static calculate(
    high: number,
    low: number,
  ): {
    level: number;
    price: number;
    label: string;
  }[] {
    const diff = high - low;
    const levels = [
      { level: 0, label: '0%' },
      { level: 0.236, label: '23.6%' },
      { level: 0.382, label: '38.2%' },
      { level: 0.5, label: '50%' },
      { level: 0.618, label: '61.8%' },
      { level: 0.786, label: '78.6%' },
      { level: 1, label: '100%' },
      { level: 1.618, label: '161.8%' },
      { level: 2.618, label: '261.8%' },
    ];

    return levels.map(({ level, label }) => ({
      level,
      price: low + diff * level,
      label,
    }));
  }
}

// Heikin-Ashi calculation
export class HeikinAshi {
  static convert(candles: MarketCandle[]): MarketCandle[] {
    if (candles.length === 0) return [];

    const haCandles: MarketCandle[] = [];

    // First candle
    const firstCandle = candles[0];
    haCandles.push({
      timestamp: firstCandle.timestamp,
      open: (firstCandle.open + firstCandle.close) / 2,
      close: (firstCandle.open + firstCandle.high + firstCandle.low + firstCandle.close) / 4,
      high: firstCandle.high,
      low: firstCandle.low,
      volume: firstCandle.volume,
    });

    // Subsequent candles
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const prevHA = haCandles[i - 1];

      const haClose = (current.open + current.high + current.low + current.close) / 4;
      const haOpen = (prevHA.open + prevHA.close) / 2;
      const haHigh = Math.max(current.high, haOpen, haClose);
      const haLow = Math.min(current.low, haOpen, haClose);

      haCandles.push({
        timestamp: current.timestamp,
        open: haOpen,
        close: haClose,
        high: haHigh,
        low: haLow,
        volume: current.volume,
      });
    }

    return haCandles;
  }
}

// Time frame conversions
export class TimeFrameConverter {
  static getMilliseconds(timeframe: TimeFrame): number {
    const map: Record<TimeFrame, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
    };
    return map[timeframe];
  }

  static aggregate(
    candles: MarketCandle[],
    fromTimeframe: TimeFrame,
    toTimeframe: TimeFrame,
  ): MarketCandle[] {
    const fromMs = this.getMilliseconds(fromTimeframe);
    const toMs = this.getMilliseconds(toTimeframe);

    if (fromMs >= toMs) return candles; // Can't aggregate to smaller timeframe

    const aggregated: MarketCandle[] = [];
    const ratio = Math.floor(toMs / fromMs);

    for (let i = 0; i < candles.length; i += ratio) {
      const slice = candles.slice(i, i + ratio);
      if (slice.length === 0) continue;

      aggregated.push({
        timestamp: slice[0].timestamp,
        open: slice[0].open,
        high: Math.max(...slice.map((c) => c.high)),
        low: Math.min(...slice.map((c) => c.low)),
        close: slice[slice.length - 1].close,
        volume: slice.reduce((sum, c) => sum + c.volume, 0),
      });
    }

    return aggregated;
  }
}

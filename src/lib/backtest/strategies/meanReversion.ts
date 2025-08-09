import { BacktestStrategy } from '../types';

export const meanReversionStrategy: BacktestStrategy = {
  id: 'mean-reversion-rsi',
  name: 'RSI 평균회귀 전략',
  description: 'RSI 과매도/과매수 구간을 활용한 평균회귀 전략',
  type: 'meanReversion',
  parameters: {
    rsiPeriod: 14,
    oversoldLevel: 30,
    overboughtLevel: 70,
    positionSize: 0.1,
    maxPositions: 5,
  },
};

export function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) {
    return 50; // neutral
  }

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return rsi;
}

export function getMeanReversionSignal(
  prices: number[],
  rsiPeriod: number,
  oversoldLevel: number,
  overboughtLevel: number,
): 'BUY' | 'SELL' | 'HOLD' {
  const rsi = calculateRSI(prices, rsiPeriod);
  const previousRSI = calculateRSI(prices.slice(0, -1), rsiPeriod);

  // Buy signal: RSI crosses above oversold level
  if (previousRSI <= oversoldLevel && rsi > oversoldLevel) {
    return 'BUY';
  }

  // Sell signal: RSI crosses below overbought level
  if (previousRSI >= overboughtLevel && rsi < overboughtLevel) {
    return 'SELL';
  }

  return 'HOLD';
}

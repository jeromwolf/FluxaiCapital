import { BacktestStrategy } from '../types';

export const momentumStrategy: BacktestStrategy = {
  id: 'momentum-20',
  name: '20일 모멘텀 전략',
  description: '20일 이동평균을 기준으로 상승 추세 종목 매수',
  type: 'momentum',
  parameters: {
    lookbackPeriod: 20,
    positionSize: 0.1, // 10% per position
    maxPositions: 10,
    stopLoss: 0.05, // 5% stop loss
    takeProfit: 0.15, // 15% take profit
  },
};

export function calculateMomentumSignal(
  prices: number[],
  lookbackPeriod: number,
): 'BUY' | 'SELL' | 'HOLD' {
  if (prices.length < lookbackPeriod + 1) {
    return 'HOLD';
  }

  const currentPrice = prices[prices.length - 1];
  const ma = prices.slice(-lookbackPeriod).reduce((a, b) => a + b, 0) / lookbackPeriod;
  const previousPrice = prices[prices.length - 2];
  const previousMA =
    prices.slice(-lookbackPeriod - 1, -1).reduce((a, b) => a + b, 0) / lookbackPeriod;

  // Buy signal: price crosses above MA
  if (previousPrice <= previousMA && currentPrice > ma) {
    return 'BUY';
  }

  // Sell signal: price crosses below MA
  if (previousPrice >= previousMA && currentPrice < ma) {
    return 'SELL';
  }

  return 'HOLD';
}

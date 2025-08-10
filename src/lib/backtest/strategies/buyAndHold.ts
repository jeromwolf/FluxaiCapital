import { MarketData, Signal } from '../types';

import { BaseStrategy } from './base';

export class BuyAndHoldStrategy extends BaseStrategy {
  private hasBought = false;

  constructor(parameters: { targetWeight?: number } = {}) {
    super('Buy and Hold', '초기에 자산을 매수하고 보유 기간 동안 보유하는 전략', {
      targetWeight: 1.0, // 100% 투자
      ...parameters,
    });
  }

  generateSignals(data: MarketData[], holdings: Map<string, number>): Signal[] {
    const signals: Signal[] = [];

    // 첫 거래일에만 매수
    if (!this.hasBought && data.length > 0) {
      for (const marketData of data) {
        signals.push(
          this.createSignal(
            marketData.date,
            marketData.symbol,
            'buy',
            undefined, // 엔진에서 계산
            1.0,
            'Buy and Hold 초기 매수',
          ),
        );
      }
      this.hasBought = true;
    }

    return signals;
  }

  reset(): void {
    this.hasBought = false;
  }
}

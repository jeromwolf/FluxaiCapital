import { BaseStrategy } from './base';
import { MarketData, Signal } from '../types';

export class RebalancingStrategy extends BaseStrategy {
  private lastRebalanceDate: Date | null = null;

  constructor(parameters: {
    rebalancePeriod?: 'monthly' | 'quarterly' | 'yearly';
    targetWeights?: Record<string, number>;
    threshold?: number;
  } = {}) {
    super(
      'Rebalancing',
      '정기적으로 목표 비중에 맞춰 리밸런싱하는 전략',
      {
        rebalancePeriod: 'monthly',
        targetWeights: {},
        threshold: 0.05, // 5% 이상 차이날 때 리밸런싱
        ...parameters,
      }
    );
  }

  generateSignals(data: MarketData[], holdings: Map<string, number>): Signal[] {
    const signals: Signal[] = [];
    
    if (data.length === 0) return signals;

    const currentDate = data[0].date;
    
    // 리밸런싱 필요성 확인
    if (this.shouldRebalance(currentDate, data, holdings)) {
      const rebalanceSignals = this.calculateRebalanceSignals(data, holdings);
      signals.push(...rebalanceSignals);
      this.lastRebalanceDate = currentDate;
    }

    return signals;
  }

  private shouldRebalance(currentDate: Date, data: MarketData[], holdings: Map<string, number>): boolean {
    // 첫 거래일인 경우
    if (this.lastRebalanceDate === null) {
      return true;
    }

    // 정기 리밸런싱 확인
    const daysDiff = Math.floor((currentDate.getTime() - this.lastRebalanceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let rebalanceDays: number;
    switch (this.parameters.rebalancePeriod) {
      case 'monthly':
        rebalanceDays = 30;
        break;
      case 'quarterly':
        rebalanceDays = 90;
        break;
      case 'yearly':
        rebalanceDays = 365;
        break;
      default:
        rebalanceDays = 30;
    }

    if (daysDiff >= rebalanceDays) {
      return true;
    }

    // 임계치 기반 리밸런싱 확인
    const currentWeights = this.calculateCurrentWeights(data, holdings);
    const targetWeights = this.parameters.targetWeights;

    for (const symbol of Object.keys(targetWeights)) {
      const currentWeight = currentWeights[symbol] || 0;
      const targetWeight = targetWeights[symbol] || 0;
      
      if (Math.abs(currentWeight - targetWeight) > this.parameters.threshold) {
        return true;
      }
    }

    return false;
  }

  private calculateCurrentWeights(data: MarketData[], holdings: Map<string, number>): Record<string, number> {
    const weights: Record<string, number> = {};
    let totalValue = 0;

    // 각 자산의 현재 가치 계산
    const assetValues: Record<string, number> = {};
    
    for (const marketData of data) {
      const quantity = holdings.get(marketData.symbol) || 0;
      const value = quantity * marketData.close;
      assetValues[marketData.symbol] = value;
      totalValue += value;
    }

    // 가중치 계산
    for (const symbol of Object.keys(assetValues)) {
      weights[symbol] = totalValue > 0 ? assetValues[symbol] / totalValue : 0;
    }

    return weights;
  }

  private calculateRebalanceSignals(data: MarketData[], holdings: Map<string, number>): Signal[] {
    const signals: Signal[] = [];
    const currentWeights = this.calculateCurrentWeights(data, holdings);
    const targetWeights = this.parameters.targetWeights;

    // 목표 가중치가 설정되지 않은 경우 동일 가중치로 설정
    if (Object.keys(targetWeights).length === 0) {
      const equalWeight = 1.0 / data.length;
      for (const marketData of data) {
        targetWeights[marketData.symbol] = equalWeight;
      }
    }

    // 총 포트폴리오 가치 계산
    let totalValue = 0;
    for (const marketData of data) {
      const quantity = holdings.get(marketData.symbol) || 0;
      totalValue += quantity * marketData.close;
    }

    // 각 자산별 리밸런싱 시그널 생성
    for (const marketData of data) {
      const symbol = marketData.symbol;
      const currentWeight = currentWeights[symbol] || 0;
      const targetWeight = targetWeights[symbol] || 0;
      const weightDiff = targetWeight - currentWeight;

      if (Math.abs(weightDiff) > 0.001) { // 0.1% 이상 차이
        const targetValue = totalValue * targetWeight;
        const currentQuantity = holdings.get(symbol) || 0;
        const targetQuantity = Math.floor(targetValue / marketData.close);
        const quantityDiff = targetQuantity - currentQuantity;

        if (quantityDiff > 0) {
          // 매수 시그널
          signals.push(
            this.createSignal(
              marketData.date,
              symbol,
              'buy',
              quantityDiff,
              Math.abs(weightDiff),
              `리밸런싱: ${(currentWeight * 100).toFixed(2)}% → ${(targetWeight * 100).toFixed(2)}%`
            )
          );
        } else if (quantityDiff < 0) {
          // 매도 시그널
          signals.push(
            this.createSignal(
              marketData.date,
              symbol,
              'sell',
              Math.abs(quantityDiff),
              Math.abs(weightDiff),
              `리밸런싱: ${(currentWeight * 100).toFixed(2)}% → ${(targetWeight * 100).toFixed(2)}%`
            )
          );
        }
      }
    }

    return signals;
  }

  reset(): void {
    this.lastRebalanceDate = null;
  }
}
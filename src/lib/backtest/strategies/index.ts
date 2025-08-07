// 백테스팅 전략 모음

export { BaseStrategy } from './base';
export { BuyAndHoldStrategy } from './buyAndHold';
export { RebalancingStrategy } from './rebalancing';
export { MovingAverageStrategy } from './movingAverage';

import { BaseStrategy } from './base';
import { BuyAndHoldStrategy } from './buyAndHold';
import { RebalancingStrategy } from './rebalancing';
import { MovingAverageStrategy } from './movingAverage';

export interface StrategyConfig {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  createInstance: (parameters?: Record<string, any>) => BaseStrategy;
}

export const AVAILABLE_STRATEGIES: StrategyConfig[] = [
  {
    id: 'buy-and-hold',
    name: 'Buy and Hold',
    description: '초기에 자산을 매수하고 보유 기간 동안 보유하는 전략',
    parameters: {
      targetWeight: {
        type: 'number',
        default: 1.0,
        min: 0.1,
        max: 1.0,
        step: 0.1,
        description: '투자 비중 (0.1 = 10%)',
      },
    },
    createInstance: (params) => new BuyAndHoldStrategy(params),
  },
  {
    id: 'rebalancing',
    name: 'Rebalancing',
    description: '정기적으로 목표 비중에 맞춰 리밸런싱하는 전략',
    parameters: {
      rebalancePeriod: {
        type: 'select',
        default: 'monthly',
        options: [
          { value: 'monthly', label: '매월' },
          { value: 'quarterly', label: '분기별' },
          { value: 'yearly', label: '연간' },
        ],
        description: '리밸런싱 주기',
      },
      threshold: {
        type: 'number',
        default: 0.05,
        min: 0.01,
        max: 0.2,
        step: 0.01,
        description: '리밸런싱 임계치 (5% = 0.05)',
      },
    },
    createInstance: (params) => new RebalancingStrategy(params),
  },
  {
    id: 'moving-average',
    name: 'Moving Average',
    description: '이동평균선 교차를 기반으로 한 매매 전략',
    parameters: {
      fastPeriod: {
        type: 'number',
        default: 20,
        min: 5,
        max: 100,
        step: 1,
        description: '단기 이동평균 기간',
      },
      slowPeriod: {
        type: 'number',
        default: 50,
        min: 10,
        max: 200,
        step: 1,
        description: '장기 이동평균 기간',
      },
      type: {
        type: 'select',
        default: 'sma',
        options: [
          { value: 'sma', label: '단순 이동평균 (SMA)' },
          { value: 'ema', label: '지수 이동평균 (EMA)' },
        ],
        description: '이동평균 타입',
      },
    },
    createInstance: (params) => new MovingAverageStrategy(params),
  },
];

export function getStrategyById(id: string): StrategyConfig | undefined {
  return AVAILABLE_STRATEGIES.find(strategy => strategy.id === id);
}

export function createStrategy(id: string, parameters?: Record<string, any>): BaseStrategy | null {
  const config = getStrategyById(id);
  if (!config) return null;
  
  return config.createInstance(parameters);
}
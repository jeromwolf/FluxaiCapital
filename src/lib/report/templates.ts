import { ReportTemplate, ReportSection } from './types';

// 기본 리포트 템플릿들
export const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'portfolio-summary',
    name: '포트폴리오 요약 리포트',
    description: '포트폴리오의 전반적인 현황과 성과를 요약한 기본 리포트',
    type: 'portfolio',
    defaultPeriod: 'monthly',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'executive-summary',
        name: '요약',
        type: 'summary',
        order: 1,
        isRequired: true,
        configuration: {
          metrics: ['totalValue', 'totalReturn', 'sharpeRatio', 'maxDrawdown'],
        },
      },
      {
        id: 'performance-overview',
        name: '성과 개요',
        type: 'performance',
        order: 2,
        isRequired: true,
        configuration: {
          showChart: true,
          chartType: 'line',
          compareWithBenchmark: true,
          metrics: ['totalReturn', 'volatility', 'sharpeRatio'],
        },
      },
      {
        id: 'holdings-breakdown',
        name: '보유 자산',
        type: 'holdings',
        order: 3,
        isRequired: true,
        configuration: {
          showChart: true,
          chartType: 'pie',
          metrics: ['weight', 'marketValue', 'unrealizedPnL'],
        },
      },
      {
        id: 'transaction-summary',
        name: '거래 내역',
        type: 'transactions',
        order: 4,
        isRequired: false,
        configuration: {
          period: 'current',
        },
      },
      {
        id: 'risk-analysis',
        name: '위험 분석',
        type: 'risk',
        order: 5,
        isRequired: false,
        configuration: {
          metrics: ['var95', 'volatility', 'beta', 'correlation'],
        },
      },
    ],
  },
  {
    id: 'performance-report',
    name: '성과 분석 리포트',
    description: '포트폴리오의 성과를 상세히 분석한 리포트',
    type: 'performance',
    defaultPeriod: 'quarterly',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'performance-summary',
        name: '성과 요약',
        type: 'summary',
        order: 1,
        isRequired: true,
        configuration: {
          metrics: ['totalReturn', 'annualizedReturn', 'volatility', 'sharpeRatio'],
        },
      },
      {
        id: 'return-analysis',
        name: '수익률 분석',
        type: 'performance',
        order: 2,
        isRequired: true,
        configuration: {
          showChart: true,
          chartType: 'line',
          compareWithBenchmark: true,
        },
      },
      {
        id: 'risk-return',
        name: '위험-수익 분석',
        type: 'charts',
        order: 3,
        isRequired: true,
        configuration: {
          chartType: 'area',
          metrics: ['drawdown', 'volatility'],
        },
      },
      {
        id: 'benchmark-comparison',
        name: '벤치마크 비교',
        type: 'performance',
        order: 4,
        isRequired: true,
        configuration: {
          compareWithBenchmark: true,
          showChart: true,
          chartType: 'bar',
        },
      },
      {
        id: 'sector-performance',
        name: '섹터별 성과',
        type: 'charts',
        order: 5,
        isRequired: false,
        configuration: {
          chartType: 'bar',
        },
      },
    ],
  },
  {
    id: 'risk-report',
    name: '위험 관리 리포트',
    description: '포트폴리오의 위험 요소를 분석한 리포트',
    type: 'risk',
    defaultPeriod: 'monthly',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'risk-summary',
        name: '위험 요약',
        type: 'summary',
        order: 1,
        isRequired: true,
        configuration: {
          metrics: ['var95', 'expectedShortfall', 'beta', 'volatility'],
        },
      },
      {
        id: 'var-analysis',
        name: 'VaR 분석',
        type: 'risk',
        order: 2,
        isRequired: true,
        configuration: {
          metrics: ['var95', 'var99', 'expectedShortfall'],
          showChart: true,
          chartType: 'line',
        },
      },
      {
        id: 'drawdown-analysis',
        name: '드로우다운 분석',
        type: 'charts',
        order: 3,
        isRequired: true,
        configuration: {
          chartType: 'area',
          metrics: ['drawdown'],
        },
      },
      {
        id: 'concentration-risk',
        name: '집중도 위험',
        type: 'risk',
        order: 4,
        isRequired: true,
        configuration: {
          metrics: ['concentration'],
          showChart: true,
          chartType: 'pie',
        },
      },
      {
        id: 'correlation-matrix',
        name: '상관관계 분석',
        type: 'risk',
        order: 5,
        isRequired: false,
        configuration: {
          metrics: ['correlation'],
        },
      },
    ],
  },
  {
    id: 'trading-report',
    name: '거래 활동 리포트',
    description: '거래 내역과 패턴을 분석한 리포트',
    type: 'trading',
    defaultPeriod: 'monthly',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'trading-summary',
        name: '거래 요약',
        type: 'summary',
        order: 1,
        isRequired: true,
        configuration: {
          metrics: ['totalTrades', 'winRate', 'avgProfit', 'avgLoss'],
        },
      },
      {
        id: 'transaction-details',
        name: '거래 내역',
        type: 'transactions',
        order: 2,
        isRequired: true,
        configuration: {
          period: 'current',
        },
      },
      {
        id: 'trading-performance',
        name: '거래 성과',
        type: 'charts',
        order: 3,
        isRequired: true,
        configuration: {
          chartType: 'bar',
          metrics: ['profitLoss', 'volume'],
        },
      },
      {
        id: 'asset-turnover',
        name: '자산 회전율',
        type: 'charts',
        order: 4,
        isRequired: false,
        configuration: {
          chartType: 'line',
          metrics: ['turnover'],
        },
      },
      {
        id: 'cost-analysis',
        name: '거래 비용 분석',
        type: 'transactions',
        order: 5,
        isRequired: false,
        configuration: {
          metrics: ['fees', 'slippage'],
          showChart: true,
          chartType: 'pie',
        },
      },
    ],
  },
  {
    id: 'daily-report',
    name: '일일 리포트',
    description: '포트폴리오의 일일 현황을 요약한 간단한 리포트',
    type: 'portfolio',
    defaultPeriod: 'daily',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'daily-summary',
        name: '일일 요약',
        type: 'summary',
        order: 1,
        isRequired: true,
        configuration: {
          metrics: ['totalValue', 'dailyReturn', 'dailyPnL'],
        },
      },
      {
        id: 'market-movers',
        name: '주요 변동',
        type: 'holdings',
        order: 2,
        isRequired: true,
        configuration: {
          metrics: ['dailyChange', 'topGainers', 'topLosers'],
        },
      },
      {
        id: 'daily-transactions',
        name: '당일 거래',
        type: 'transactions',
        order: 3,
        isRequired: false,
        configuration: {
          period: 'today',
        },
      },
      {
        id: 'market-news',
        name: '시장 동향',
        type: 'market',
        order: 4,
        isRequired: false,
      },
    ],
  },
];

export function getTemplateById(id: string): ReportTemplate | undefined {
  return DEFAULT_TEMPLATES.find((template) => template.id === id);
}

export function getTemplatesByType(type: string): ReportTemplate[] {
  return DEFAULT_TEMPLATES.filter((template) => template.type === type);
}

export function getActiveTemplates(): ReportTemplate[] {
  return DEFAULT_TEMPLATES.filter((template) => template.isActive);
}

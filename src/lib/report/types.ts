// 리포트 관련 타입 정의

export interface Report {
  id: string;
  userId: string;
  portfolioId: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  title: string;
  status: ReportStatus;
  format: ReportFormat;
  createdAt: Date;
  updatedAt: Date;
  filePath?: string;
  fileSize?: number;
  emailSent?: boolean;
  emailSentAt?: Date;
}

export type ReportType = 'portfolio' | 'performance' | 'risk' | 'trading' | 'custom';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'expired';
export type ReportFormat = 'pdf' | 'excel' | 'json' | 'csv';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  sections: ReportSection[];
  defaultPeriod: ReportPeriod;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  name: string;
  type: SectionType;
  order: number;
  isRequired: boolean;
  configuration?: SectionConfiguration;
}

export type SectionType =
  | 'summary'
  | 'performance'
  | 'holdings'
  | 'transactions'
  | 'risk'
  | 'charts'
  | 'market'
  | 'custom';

export interface SectionConfiguration {
  showChart?: boolean;
  chartType?: 'line' | 'bar' | 'pie' | 'area';
  metrics?: string[];
  period?: string;
  compareWithBenchmark?: boolean;
  customQuery?: string;
}

export interface ReportData {
  portfolio: PortfolioSummary;
  performance: PerformanceData;
  holdings: HoldingData[];
  transactions: TransactionData[];
  riskMetrics: RiskData;
  marketData?: MarketSummary;
  charts?: ChartData[];
  metadata: ReportMetadata;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  inception: Date;
  lastUpdate: Date;
  benchmark?: string;
}

export interface PerformanceData {
  totalReturn: number;
  periodReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate?: number;
  benchmarkComparison?: {
    benchmarkReturn: number;
    relativeReturn: number;
    correlation: number;
    beta: number;
    alpha: number;
  };
}

export interface HoldingData {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  weight: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  sector?: string;
  assetClass?: string;
}

export interface TransactionData {
  date: Date;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'deposit' | 'withdrawal';
  quantity?: number;
  price?: number;
  amount: number;
  fee?: number;
  notes?: string;
}

export interface RiskData {
  var95: number;
  var99: number;
  expectedShortfall: number;
  beta: number;
  volatility: number;
  correlation: number;
  concentration: {
    top5Holdings: number;
    top10Holdings: number;
    maxPosition: number;
  };
  sectorExposure?: Record<string, number>;
}

export interface MarketSummary {
  marketIndex: string;
  marketReturn: number;
  marketVolatility: number;
  economicIndicators?: {
    gdpGrowth?: number;
    inflation?: number;
    interestRate?: number;
    exchangeRate?: number;
  };
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
}

export interface ReportMetadata {
  generatedAt: Date;
  generatedBy: string;
  version: string;
  reportId: string;
  portfolioId: string;
  period: {
    start: Date;
    end: Date;
    label: string;
  };
  disclaimer?: string;
  watermark?: string;
}

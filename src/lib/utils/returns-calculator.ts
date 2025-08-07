import { Period } from '@/components/dashboard/PeriodTabs';
import { 
  differenceInDays,
  parseISO 
} from 'date-fns';

export interface PriceData {
  date: string;
  price: number;
  volume?: number;
}

export interface PositionData {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  cost: number;
  returns: number;
  percentage: number;
}

export interface PortfolioReturns {
  totalReturns: number;
  percentageReturns: number;
  annualizedReturns: number;
  periodReturns: Record<Period, number>;
  dailyReturns: number[];
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
}

/**
 * Calculate simple returns
 */
export function calculateSimpleReturns(
  initialValue: number,
  finalValue: number
): { returns: number; percentage: number } {
  const returns = finalValue - initialValue;
  const percentage = initialValue > 0 ? (returns / initialValue) * 100 : 0;
  
  return { returns, percentage };
}

/**
 * Calculate annualized returns
 */
export function calculateAnnualizedReturns(
  initialValue: number,
  finalValue: number,
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const days = differenceInDays(end, start);
  if (days <= 0 || initialValue <= 0) return 0;
  
  const totalReturn = (finalValue - initialValue) / initialValue;
  const annualizedReturn = Math.pow(1 + totalReturn, 365 / days) - 1;
  
  return annualizedReturn * 100;
}

/**
 * Calculate daily returns from price data
 */
export function calculateDailyReturns(priceData: PriceData[]): number[] {
  if (priceData.length < 2) return [];
  
  const returns: number[] = [];
  
  for (let i = 1; i < priceData.length; i++) {
    const previousPrice = priceData[i - 1]?.price;
    const currentPrice = priceData[i]?.price;
    
    if (!previousPrice || !currentPrice) continue;
    
    if (previousPrice > 0) {
      const dailyReturn = ((currentPrice - previousPrice) / previousPrice) * 100;
      returns.push(dailyReturn);
    }
  }
  
  return returns;
}

/**
 * Calculate volatility (standard deviation of returns)
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / (returns.length - 1);
  
  // Annualized volatility (assuming daily returns)
  return Math.sqrt(variance * 252);
}

/**
 * Calculate Sharpe Ratio
 */
export function calculateSharpeRatio(
  returns: number,
  volatility: number,
  riskFreeRate: number = 2.5 // Default 2.5% risk-free rate
): number {
  if (volatility === 0) return 0;
  return (returns - riskFreeRate) / volatility;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaxDrawdown(priceData: PriceData[]): {
  maxDrawdown: number;
  maxDrawdownStart: string;
  maxDrawdownEnd: string;
} {
  if (priceData.length < 2) {
    return { maxDrawdown: 0, maxDrawdownStart: '', maxDrawdownEnd: '' };
  }
  
  let maxDrawdown = 0;
  let peak = priceData[0]?.price || 0;
  let maxDrawdownStart = priceData[0]?.date || '';
  let maxDrawdownEnd = priceData[0]?.date || '';
  let currentPeakDate = priceData[0]?.date || '';
  
  for (let i = 1; i < priceData.length; i++) {
    const currentPrice = priceData[i]?.price;
    const currentDate = priceData[i]?.date;
    
    if (!currentPrice || !currentDate) continue;
    
    if (currentPrice > peak) {
      peak = currentPrice;
      currentPeakDate = currentDate;
    } else {
      const drawdown = ((peak - currentPrice) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownStart = currentPeakDate;
        maxDrawdownEnd = currentDate;
      }
    }
  }
  
  return { maxDrawdown, maxDrawdownStart, maxDrawdownEnd };
}

/**
 * Calculate win rate (percentage of positive return days)
 */
export function calculateWinRate(returns: number[]): number {
  if (returns.length === 0) return 0;
  
  const positiveReturns = returns.filter(r => r > 0).length;
  return (positiveReturns / returns.length) * 100;
}

/**
 * Calculate position returns
 */
export function calculatePositionReturns(position: {
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}): PositionData {
  const cost = position.quantity * position.averagePrice;
  const value = position.quantity * position.currentPrice;
  const returns = value - cost;
  const percentage = cost > 0 ? (returns / cost) * 100 : 0;
  
  return {
    ...position,
    symbol: '', // To be filled by caller
    cost,
    value,
    returns,
    percentage
  };
}

/**
 * Calculate portfolio returns from positions
 */
export function calculatePortfolioReturnsFromPositions(
  positions: PositionData[]
): {
  totalValue: number;
  totalCost: number;
  totalReturns: number;
  percentageReturns: number;
} {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.cost, 0);
  const totalReturns = totalValue - totalCost;
  const percentageReturns = totalCost > 0 ? (totalReturns / totalCost) * 100 : 0;
  
  return {
    totalValue,
    totalCost,
    totalReturns,
    percentageReturns
  };
}

/**
 * Calculate returns for each period
 */
export function calculateReturnsForAllPeriods(
  priceData: PriceData[]
): Record<Period, { returns: number; percentage: number }> {
  if (priceData.length === 0) {
    return {
      '1D': { returns: 0, percentage: 0 },
      '1W': { returns: 0, percentage: 0 },
      '1M': { returns: 0, percentage: 0 },
      '3M': { returns: 0, percentage: 0 },
      '6M': { returns: 0, percentage: 0 },
      '1Y': { returns: 0, percentage: 0 },
      'ALL': { returns: 0, percentage: 0 }
    };
  }
  
  const latestData = priceData[priceData.length - 1];
  if (!latestData) {
    return {
      '1D': { returns: 0, percentage: 0 },
      '1W': { returns: 0, percentage: 0 },
      '1M': { returns: 0, percentage: 0 },
      '3M': { returns: 0, percentage: 0 },
      '6M': { returns: 0, percentage: 0 },
      '1Y': { returns: 0, percentage: 0 },
      'ALL': { returns: 0, percentage: 0 }
    };
  }
  
  const latestPrice = latestData.price;
  const periods: Period[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  const daysMap: Record<Period, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    'ALL': priceData.length
  };
  
  const results: Record<Period, { returns: number; percentage: number }> = {} as any;
  
  for (const period of periods) {
    const days = daysMap[period];
    const index = Math.max(0, priceData.length - days);
    const startData = priceData[index];
    
    if (!startData) {
      results[period] = { returns: 0, percentage: 0 };
    } else {
      results[period] = calculateSimpleReturns(startData.price, latestPrice);
    }
  }
  
  return results;
}

/**
 * Format returns for display
 */
export function formatReturns(
  returns: number,
  percentage: number,
  locale: string = 'ko-KR'
): {
  returnsText: string;
  percentageText: string;
  className: string;
} {
  const isPositive = returns >= 0;
  const sign = isPositive ? '+' : '';
  
  return {
    returnsText: `${sign}${returns.toLocaleString(locale)}`,
    percentageText: `${sign}${percentage.toFixed(2)}%`,
    className: isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400'
  };
}

/**
 * Get performance grade based on returns
 */
export function getPerformanceGrade(annualizedReturns: number): {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
} {
  if (annualizedReturns >= 30) {
    return { grade: 'S', label: '최우수', color: 'text-purple-600 dark:text-purple-400' };
  } else if (annualizedReturns >= 20) {
    return { grade: 'A', label: '우수', color: 'text-blue-600 dark:text-blue-400' };
  } else if (annualizedReturns >= 10) {
    return { grade: 'B', label: '양호', color: 'text-green-600 dark:text-green-400' };
  } else if (annualizedReturns >= 5) {
    return { grade: 'C', label: '보통', color: 'text-yellow-600 dark:text-yellow-400' };
  } else if (annualizedReturns >= 0) {
    return { grade: 'D', label: '미흡', color: 'text-orange-600 dark:text-orange-400' };
  } else {
    return { grade: 'F', label: '부진', color: 'text-red-600 dark:text-red-400' };
  }
}
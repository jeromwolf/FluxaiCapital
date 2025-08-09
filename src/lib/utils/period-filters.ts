import { Period } from '@/components/dashboard/PeriodTabs';
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO } from 'date-fns';

export interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface PortfolioData extends DataPoint {
  date: string;
  value: number; // Same as totalValue for DataPoint compatibility
  totalValue: number;
  returns: number;
  positions?: any[];
}

/**
 * Get the start date for a given period
 */
export function getStartDateForPeriod(period: Period, baseDate: Date = new Date()): Date {
  switch (period) {
    case '1D':
      return addDays(baseDate, -1);
    case '1W':
      return addWeeks(baseDate, -1);
    case '1M':
      return addMonths(baseDate, -1);
    case '3M':
      return addMonths(baseDate, -3);
    case '6M':
      return addMonths(baseDate, -6);
    case '1Y':
      return addYears(baseDate, -1);
    case 'ALL':
      return new Date(0); // Beginning of time
    default:
      return addMonths(baseDate, -1); // Default to 1 month
  }
}

/**
 * Filter data points by period
 */
export function filterDataByPeriod<T extends DataPoint>(
  data: T[],
  period: Period,
  dateField: keyof T = 'date' as keyof T,
): T[] {
  if (!data || data.length === 0) return [];
  if (period === 'ALL') return data;

  const startDate = getStartDateForPeriod(period);

  return data.filter((item) => {
    const itemDate =
      typeof item[dateField] === 'string'
        ? parseISO(item[dateField] as string)
        : new Date(item[dateField] as string | number | Date);

    return isAfter(itemDate, startDate) || itemDate.getTime() === startDate.getTime();
  });
}

/**
 * Calculate returns for a given period
 */
export function calculatePeriodReturns(
  data: PortfolioData[],
  period: Period,
): {
  returns: number;
  percentageChange: number;
  startValue: number;
  endValue: number;
  startDate: string;
  endDate: string;
} {
  const filteredData = filterDataByPeriod(data, period);

  if (filteredData.length < 2) {
    return {
      returns: 0,
      percentageChange: 0,
      startValue: filteredData[0]?.totalValue || 0,
      endValue: filteredData[0]?.totalValue || 0,
      startDate: filteredData[0]?.date || '',
      endDate: filteredData[0]?.date || '',
    };
  }

  const startData = filteredData[0];
  const endData = filteredData[filteredData.length - 1];

  if (!startData || !endData) {
    return {
      returns: 0,
      percentageChange: 0,
      startValue: 0,
      endValue: 0,
      startDate: '',
      endDate: '',
    };
  }

  const returns = endData.totalValue - startData.totalValue;
  const percentageChange =
    startData.totalValue > 0
      ? ((endData.totalValue - startData.totalValue) / startData.totalValue) * 100
      : 0;

  return {
    returns,
    percentageChange,
    startValue: startData.totalValue,
    endValue: endData.totalValue,
    startDate: startData.date,
    endDate: endData.date,
  };
}

/**
 * Get period label in Korean
 */
export function getPeriodLabel(period: Period): string {
  const labels: Record<Period, string> = {
    '1D': '일간',
    '1W': '주간',
    '1M': '월간',
    '3M': '3개월',
    '6M': '6개월',
    '1Y': '연간',
    ALL: '전체',
  };

  return labels[period] || period;
}

/**
 * Format period returns for display
 */
export function formatPeriodReturns(
  returns: number,
  percentageChange: number,
): {
  returnsText: string;
  percentageText: string;
  isPositive: boolean;
} {
  const isPositive = returns >= 0;

  return {
    returnsText: `${isPositive ? '+' : ''}${returns.toLocaleString('ko-KR')} KRW`,
    percentageText: `${isPositive ? '+' : ''}${percentageChange.toFixed(2)}%`,
    isPositive,
  };
}

/**
 * Get appropriate data granularity for period
 */
export function getDataGranularityForPeriod(
  period: Period,
): 'hourly' | 'daily' | 'weekly' | 'monthly' {
  switch (period) {
    case '1D':
      return 'hourly';
    case '1W':
    case '1M':
      return 'daily';
    case '3M':
    case '6M':
      return 'weekly';
    case '1Y':
    case 'ALL':
      return 'monthly';
    default:
      return 'daily';
  }
}

/**
 * Aggregate data points by granularity
 */
export function aggregateDataByGranularity<T extends DataPoint>(
  data: T[],
  granularity: 'hourly' | 'daily' | 'weekly' | 'monthly',
  valueField: keyof T = 'value' as keyof T,
): T[] {
  // This is a simplified version. In production, you'd want more sophisticated aggregation
  if (granularity === 'hourly' || data.length <= 100) {
    return data;
  }

  // Simple sampling for demo purposes
  const sampleRate = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;
  return data.filter((_, index) => index % sampleRate === 0);
}

/**
 * Get comparison period for performance analysis
 */
export function getComparisonPeriod(period: Period): Period {
  const comparisonMap: Record<Period, Period> = {
    '1D': '1W',
    '1W': '1M',
    '1M': '3M',
    '3M': '6M',
    '6M': '1Y',
    '1Y': 'ALL',
    ALL: 'ALL',
  };

  return comparisonMap[period];
}

/**
 * Check if data is stale for a period
 */
export function isDataStaleForPeriod(lastUpdateTime: Date | string, period: Period): boolean {
  const lastUpdate = typeof lastUpdateTime === 'string' ? parseISO(lastUpdateTime) : lastUpdateTime;

  const now = new Date();
  const timeDiff = now.getTime() - lastUpdate.getTime();

  // Define staleness thresholds for each period
  const staleThresholds: Record<Period, number> = {
    '1D': 5 * 60 * 1000, // 5 minutes
    '1W': 15 * 60 * 1000, // 15 minutes
    '1M': 60 * 60 * 1000, // 1 hour
    '3M': 6 * 60 * 60 * 1000, // 6 hours
    '6M': 24 * 60 * 60 * 1000, // 1 day
    '1Y': 24 * 60 * 60 * 1000, // 1 day
    ALL: 7 * 24 * 60 * 60 * 1000, // 1 week
  };

  return timeDiff > (staleThresholds[period] || staleThresholds['1M']);
}

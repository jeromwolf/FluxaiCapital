'use client';

import React from 'react';

import { MiniChart, PerformanceChart } from '@/components/charts';
import { ResponsivePeriodTabs, usePeriod } from '@/components/dashboard/PeriodTabs';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';
import { usePeriodData } from '@/hooks/usePeriodData';
import { cn } from '@/lib/utils';
import { formatPeriodReturns, getPeriodLabel } from '@/lib/utils/period-filters';

// Mock data generator for demo
function generateMockPortfolioData() {
  const data = [];
  const baseValue = 100000000; // 100M KRW
  const days = 365;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Add some randomness
    const change = (Math.random() - 0.5) * 0.02; // ±2% daily change
    const value: number = i === 0 ? baseValue : data[i - 1].value * (1 + change);

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      totalValue: Math.round(value),
      returns: Math.round(value - baseValue),
    });
  }

  return data;
}

// Convert portfolio data to mini chart format
function portfolioToMiniChartData(data: any[]) {
  return data.map((item) => ({
    date: item.date,
    value: item.totalValue,
    label: new Date(item.date).toLocaleDateString('ko-KR'),
  }));
}

interface PortfolioOverviewProps {
  className?: string;
  portfolioId?: string;
  portfolioData?: any[];
  totalValue?: number;
  totalReturn?: number;
}

export function PortfolioOverview({
  className,
  portfolioId,
  portfolioData: externalData,
  totalValue,
  totalReturn,
}: PortfolioOverviewProps) {
  const { period, setPeriod } = usePeriod('1M');
  const [mockData] = React.useState(generateMockPortfolioData());
  const portfolioData = externalData || mockData;
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { filteredData, aggregatedData, returns, isLoading, isStale, refresh } = usePeriodData({
    data: portfolioData,
    period,
    autoRefresh: true,
    onDataStale: () => {
      console.log('Data is stale, would refresh here');
    },
  });

  const miniChartData = React.useMemo(
    () => portfolioToMiniChartData(aggregatedData),
    [aggregatedData],
  );

  const currentValue = totalValue || filteredData[filteredData.length - 1]?.totalValue || 0;
  const periodLabel = getPeriodLabel(period);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with period tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={cn(
              'font-bold text-gray-900 dark:text-gray-100',
              isMobile ? 'text-xl' : 'text-2xl',
            )}
          >
            포트폴리오 개요
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{periodLabel} 성과 분석</p>
        </div>

        <ResponsivePeriodTabs selected={period} onChange={setPeriod} />
      </div>

      {/* Value and returns card */}
      <ResponsiveCard className={isMobile ? '' : 'p-6'}>
        <div
          className={cn(
            'grid gap-4',
            isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
          )}
        >
          {/* Current Value */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">현재 가치</p>
            <p
              className={cn(
                'font-bold text-gray-900 dark:text-gray-100 mt-1',
                isMobile ? 'text-xl' : 'text-2xl',
              )}
            >
              {currentValue.toLocaleString('ko-KR')} KRW
            </p>
            {isStale && (
              <button
                onClick={refresh}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                업데이트 필요
              </button>
            )}
          </div>

          {/* Period Returns */}
          {returns && (
            <>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{periodLabel} 수익</p>
                <p
                  className={cn(
                    'font-bold mt-1',
                    isMobile ? 'text-xl' : 'text-2xl',
                    returns.returns >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatPeriodReturns(returns.returns, returns.percentageChange).returnsText}
                </p>
                <p
                  className={cn(
                    'text-sm mt-1',
                    returns.returns >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  )}
                >
                  {formatPeriodReturns(returns.returns, returns.percentageChange).percentageText}
                </p>
              </div>

              {/* Performance Chart - Hidden on mobile */}
              {!isMobile && (
                <div className="flex items-center justify-center md:justify-end">
                  <PerformanceChart
                    data={miniChartData.slice(-20)} // Last 20 points
                    percentage={returns.percentageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Full chart */}
        {!isLoading && miniChartData.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <MiniChart
              data={miniChartData}
              type="area"
              width="100%"
              height={isMobile ? 150 : 200}
              showAxis={!isMobile}
              trend={returns && returns.returns >= 0 ? 'up' : 'down'}
            />
          </div>
        )}

        {isLoading && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-48" />
          </div>
        )}
      </ResponsiveCard>

      {/* Period comparison */}
      <div className={cn('grid gap-3', isMobile ? 'grid-cols-2' : 'grid-cols-4')}>
        {(['1D', '1W', '1M', '1Y'] as const).map((p) => {
          const periodReturns = calculatePeriodReturns(portfolioData, p);
          const { percentageText, isPositive } = formatPeriodReturns(
            periodReturns.returns,
            periodReturns.percentageChange,
          );

          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                'rounded-lg border transition-all duration-200',
                isMobile ? 'p-3' : 'p-4',
                period === p
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              )}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel(p)}</p>
              <p
                className={cn(
                  'font-semibold mt-1',
                  isMobile ? 'text-base' : 'text-lg',
                  isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {percentageText}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper to calculate period returns
function calculatePeriodReturns(data: any[], period: string) {
  // This would normally use the imported function, but for the button grid
  // we need a simplified version
  const days: Record<string, number> = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '1Y': 365,
  };
  const periodDays = days[period] || 30;

  if (data.length < periodDays) {
    return { returns: 0, percentageChange: 0 };
  }

  const current = data[data.length - 1].totalValue;
  const previous = data[data.length - periodDays].totalValue;
  const returns = current - previous;
  const percentageChange = ((current - previous) / previous) * 100;

  return { returns, percentageChange };
}

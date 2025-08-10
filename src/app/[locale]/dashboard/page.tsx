'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

import { AssetAllocationPieChart } from '@/components/charts';
import { HoldingsTable, HoldingData } from '@/components/dashboard/HoldingsTable';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import {
  ResponsiveCard,
  ResponsiveGrid,
  CollapsibleSection,
} from '@/components/ui/responsive-card';
import { usePortfolios, useHoldings } from '@/hooks/useApi';
import { useHoldingsWithPrices } from '@/hooks/useMarketData';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

// Convert API holdings to HoldingData format
function convertToHoldingData(apiHoldings: any[]): HoldingData[] {
  if (!apiHoldings || apiHoldings.length === 0) return [];

  return apiHoldings.map((holding, index) => {
    // Generate mock price history for now
    const priceHistory: Array<{ date: string; value: number }> = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = 1 + (Math.random() - 0.5) * 0.02; // ±1% daily variation
      const price = holding.currentPrice * variation;
      const dateStr = date.toISOString().split('T')[0];
      if (dateStr) {
        priceHistory.push({
          date: dateStr,
          value: Math.round(price * 100) / 100,
        });
      }
    }

    // Map symbol to company name (in real app, this would come from API)
    const symbolToName: Record<string, string> = {
      NVDA: 'NVIDIA Corp.',
      MSFT: 'Microsoft Corp.',
      GOOGL: 'Alphabet Inc.',
      '005930': 'Samsung Electronics',
      '035420': 'NAVER Corp.',
    };

    return {
      id: holding.id || `holding-${index}`,
      symbol: holding.symbol,
      name: symbolToName[holding.symbol] || holding.symbol,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice: holding.currentPrice,
      cost: holding.quantity * holding.averagePrice,
      value: holding.marketValue,
      returns: holding.unrealizedPnL,
      percentage: (holding.unrealizedPnL / (holding.quantity * holding.averagePrice)) * 100,
      weight: holding.weight || 0,
      change24h: (Math.random() - 0.5) * 5, // Mock 24h change
      priceHistory,
    };
  });
}

// Convert holdings to pie chart data
function holdingsToPieChartData(holdings: HoldingData[]) {
  return holdings.map((h) => ({
    name: h.symbol,
    value: h.value,
    symbol: h.symbol,
    percentage: h.weight,
  }));
}

export default function DashboardPage() {
  const [sortBy, setSortBy] = React.useState<keyof HoldingData>('weight');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const isMobile = useIsMobile();
  const t = useTranslations();

  // Fetch portfolios
  const {
    data: portfolios,
    error: portfoliosError,
    isLoading: portfoliosLoading,
  } = usePortfolios();

  // Get the first active portfolio (in real app, user would select)
  const activePortfolio = portfolios?.find((p: any) => p.isActive) || portfolios?.[0];

  // Fetch holdings for the active portfolio
  const {
    data: holdingsData,
    error: holdingsError,
    isLoading: holdingsLoading,
  } = useHoldings(activePortfolio?.id || null);

  const baseHoldings = React.useMemo(() => {
    if (!holdingsData?.holdings) return [];
    return convertToHoldingData(holdingsData.holdings);
  }, [holdingsData]);

  // Get real-time prices for holdings
  const { holdings: holdingsWithPrices } = useHoldingsWithPrices(baseHoldings);
  const holdings = holdingsWithPrices.length > 0 ? holdingsWithPrices : baseHoldings;

  const isLoading = portfoliosLoading || holdingsLoading;
  const error = portfoliosError || holdingsError;

  const handleSort = (field: keyof HoldingData) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleRowClick = (holding: HoldingData) => {
    console.log('Clicked holding:', holding);
    // Navigate to holding detail page
  };

  const pieChartData = holdingsToPieChartData(holdings);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{t('common.error')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!activePortfolio) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('portfolio.noPortfolio')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {t('portfolio.createFirst')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', isMobile ? 'px-0' : 'p-6', 'max-w-7xl mx-auto')}>
      {/* Page Header - Hidden on mobile as it's in the layout */}
      {!isMobile && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.subtitle')}</p>
        </div>
      )}

      {/* Portfolio Info */}
      <div className={isMobile ? 'px-4' : ''}>
        <ResponsiveCard>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {activePortfolio.name}
          </h2>
          {activePortfolio.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activePortfolio.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              총 자산가치:{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {holdingsData?.summary?.totalValue?.toLocaleString()} KRW
              </span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              수익률:{' '}
              <span
                className={cn(
                  'font-semibold',
                  holdingsData?.summary?.totalReturn > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}
              >
                {holdingsData?.summary?.totalReturn > 0 ? '+' : ''}
                {holdingsData?.summary?.totalReturn?.toFixed(2)}%
              </span>
            </span>
          </div>
        </ResponsiveCard>
      </div>

      {/* Portfolio Overview with Period Tabs */}
      <PortfolioOverview
        portfolioId={activePortfolio.id}
        totalValue={holdingsData?.summary?.totalValue}
        totalReturn={holdingsData?.summary?.totalReturn}
      />

      {/* Asset Allocation and Holdings */}
      {isMobile ? (
        // Mobile Layout
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="px-4">
            <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }}>
              <SummaryCard title="보유 종목" value={holdings.length.toString()} unit="개" />
              <SummaryCard
                title="평균 수익률"
                value={(
                  holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length
                ).toFixed(2)}
                unit="%"
                positive={holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length > 0}
              />
              <SummaryCard
                title="최고 수익"
                value={holdings
                  .reduce((max, h) => (h.percentage > max ? h.percentage : max), -Infinity)
                  .toFixed(2)}
                unit="%"
                positive={true}
              />
              <SummaryCard
                title="최저 수익"
                value={holdings
                  .reduce((min, h) => (h.percentage < min ? h.percentage : min), Infinity)
                  .toFixed(2)}
                unit="%"
                positive={false}
              />
            </ResponsiveGrid>
          </div>

          {/* Asset Allocation Chart in Collapsible */}
          <div className="px-4">
            <CollapsibleSection title="자산 배분" defaultOpen={true}>
              <AssetAllocationPieChart
                data={pieChartData}
                subtitle="포트폴리오 구성 비중"
                height={250}
              />
            </CollapsibleSection>
          </div>
        </div>
      ) : (
        // Desktop Layout
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Asset Allocation Chart */}
          <div className="lg:col-span-1">
            <AssetAllocationPieChart
              data={pieChartData}
              title="자산 배분"
              subtitle="포트폴리오 구성 비중"
              height={350}
            />
          </div>

          {/* Holdings Summary Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <SummaryCard title="보유 종목" value={holdings.length.toString()} unit="개" />
              <SummaryCard
                title="평균 수익률"
                value={(
                  holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length
                ).toFixed(2)}
                unit="%"
                positive={holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length > 0}
              />
              <SummaryCard
                title="최고 수익"
                value={holdings
                  .reduce((max, h) => (h.percentage > max ? h.percentage : max), -Infinity)
                  .toFixed(2)}
                unit="%"
                positive={true}
              />
              <SummaryCard
                title="최저 수익"
                value={holdings
                  .reduce((min, h) => (h.percentage < min ? h.percentage : min), Infinity)
                  .toFixed(2)}
                unit="%"
                positive={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className={isMobile ? 'px-4' : ''}>
        <div className="mb-4">
          <h2
            className={cn(
              'font-semibold text-gray-900 dark:text-gray-100',
              isMobile ? 'text-lg' : 'text-xl',
            )}
          >
            보유 자산
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            포트폴리오에 포함된 모든 자산 목록
          </p>
        </div>

        <HoldingsTable
          holdings={holdings}
          onRowClick={handleRowClick}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  unit?: string;
  positive?: boolean;
}

function SummaryCard({ title, value, unit, positive }: SummaryCardProps) {
  const isMobile = useIsMobile();

  return (
    <ResponsiveCard variant="compact" className="h-full">
      <p className={cn('text-gray-600 dark:text-gray-400', isMobile ? 'text-xs' : 'text-sm')}>
        {title}
      </p>
      <p
        className={cn(
          'font-bold mt-1',
          isMobile ? 'text-lg' : 'text-2xl',
          positive !== undefined
            ? positive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-gray-100',
        )}
      >
        {positive !== undefined && (positive ? '+' : '')}
        {value}
        {unit}
      </p>
    </ResponsiveCard>
  );
}

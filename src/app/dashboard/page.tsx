'use client';

import React from 'react';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { HoldingsTable, HoldingData } from '@/components/dashboard/HoldingsTable';
import { AssetAllocationPieChart } from '@/components/charts';
import { ResponsiveCard, ResponsiveGrid, CollapsibleSection } from '@/components/ui/responsive-card';
import { useIsMobile } from '@/hooks/useMediaQuery';

// Generate mock holdings data
function generateMockHoldings(): HoldingData[] {
  const holdings = [
    { symbol: 'AAPL', name: 'Apple Inc.', quantity: 100, averagePrice: 150, currentPrice: 175, change24h: 2.5 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', quantity: 50, averagePrice: 100, currentPrice: 125, change24h: -1.2 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 75, averagePrice: 250, currentPrice: 300, change24h: 0.8 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', quantity: 30, averagePrice: 3000, currentPrice: 3200, change24h: 1.5 },
    { symbol: 'TSLA', name: 'Tesla Inc.', quantity: 25, averagePrice: 800, currentPrice: 750, change24h: -3.2 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 40, averagePrice: 400, currentPrice: 500, change24h: 4.1 },
    { symbol: 'META', name: 'Meta Platforms', quantity: 60, averagePrice: 300, currentPrice: 320, change24h: 0.5 },
  ];

  // Calculate derived values and add price history
  const totalValue = holdings.reduce((sum, h) => {
    const value = h.quantity * h.currentPrice;
    return sum + value;
  }, 0);

  return holdings.map((holding, index) => {
    const cost = holding.quantity * holding.averagePrice;
    const value = holding.quantity * holding.currentPrice;
    const returns = value - cost;
    const percentage = (returns / cost) * 100;
    const weight = (value / totalValue) * 100;

    // Generate mock price history
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
          value: Math.round(price * 100) / 100
        });
      }
    }

    return {
      id: `holding-${index}`,
      ...holding,
      cost,
      value,
      returns,
      percentage,
      weight,
      priceHistory
    };
  });
}

// Convert holdings to pie chart data
function holdingsToPieChartData(holdings: HoldingData[]) {
  return holdings.map(h => ({
    name: h.symbol,
    value: h.value,
    symbol: h.symbol,
    percentage: h.weight
  }));
}

export default function DashboardPage() {
  const [holdings] = React.useState(generateMockHoldings());
  const [sortBy, setSortBy] = React.useState<keyof HoldingData>('weight');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const isMobile = useIsMobile();

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

  return (
    <div className={cn(
      'space-y-6',
      isMobile ? 'px-0' : 'p-6',
      'max-w-7xl mx-auto'
    )}>
      {/* Page Header - Hidden on mobile as it's in the layout */}
      {!isMobile && (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            포트폴리오 성과를 한눈에 확인하세요
          </p>
        </div>
      )}

      {/* Portfolio Overview with Period Tabs */}
      <PortfolioOverview />

      {/* Asset Allocation and Holdings */}
      {isMobile ? (
        // Mobile Layout
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="px-4">
            <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }}>
              <SummaryCard
                title="보유 종목"
                value={holdings.length.toString()}
                unit="개"
              />
              <SummaryCard
                title="평균 수익률"
                value={(holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length).toFixed(2)}
                unit="%"
                positive={holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length > 0}
              />
              <SummaryCard
                title="최고 수익"
                value={holdings.reduce((max, h) => h.percentage > max ? h.percentage : max, -Infinity).toFixed(2)}
                unit="%"
                positive={true}
              />
              <SummaryCard
                title="최저 수익"
                value={holdings.reduce((min, h) => h.percentage < min ? h.percentage : min, Infinity).toFixed(2)}
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
              <SummaryCard
                title="보유 종목"
                value={holdings.length.toString()}
                unit="개"
              />
              <SummaryCard
                title="평균 수익률"
                value={(holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length).toFixed(2)}
                unit="%"
                positive={holdings.reduce((sum, h) => sum + h.percentage, 0) / holdings.length > 0}
              />
              <SummaryCard
                title="최고 수익"
                value={holdings.reduce((max, h) => h.percentage > max ? h.percentage : max, -Infinity).toFixed(2)}
                unit="%"
                positive={true}
              />
              <SummaryCard
                title="최저 수익"
                value={holdings.reduce((min, h) => h.percentage < min ? h.percentage : min, Infinity).toFixed(2)}
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
          <h2 className={cn(
            'font-semibold text-gray-900 dark:text-gray-100',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
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
      <p className={cn(
        'text-gray-600 dark:text-gray-400',
        isMobile ? 'text-xs' : 'text-sm'
      )}>{title}</p>
      <p className={cn(
        'font-bold mt-1',
        isMobile ? 'text-lg' : 'text-2xl',
        positive !== undefined
          ? positive
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
          : 'text-gray-900 dark:text-gray-100'
      )}>
        {positive !== undefined && (positive ? '+' : '')}{value}{unit}
      </p>
    </ResponsiveCard>
  );
}

import { cn } from '@/lib/utils';
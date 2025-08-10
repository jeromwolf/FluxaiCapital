'use client';

import { Plus, TrendingUp, TrendingDown, Loader2, History } from 'lucide-react';

import Link from 'next/link';
import React, { use } from 'react';
import { AssetAllocationPieChart, ReturnsChart } from '@/components/charts';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { AddTransactionDialog } from '@/components/portfolio/AddTransactionDialog';
import { DownloadReportButton } from '@/components/portfolio/DownloadReportButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePortfolio, useHoldings, holdingMutations } from '@/hooks/useApi';
import { useHoldingsWithPrices } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ portfolioId: string }>;
}

export default function PortfolioDetailPage({ params }: PageProps) {
  const { portfolioId } = use(params);
  const {
    data: portfolio,
    error: portfolioError,
    isLoading: portfolioLoading,
  } = usePortfolio(portfolioId);
  const {
    data: holdingsData,
    error: holdingsError,
    isLoading: holdingsLoading,
    mutate: refreshHoldings,
  } = useHoldings(portfolioId);

  const [isAddingHolding, setIsAddingHolding] = React.useState(false);
  const [newHolding, setNewHolding] = React.useState({
    symbol: '',
    quantity: '',
    averagePrice: '',
    currentPrice: '',
  });

  // Get real-time prices for holdings
  const baseHoldings = holdingsData?.holdings || [];
  const { holdings: holdingsWithPrices } = useHoldingsWithPrices(baseHoldings);
  const holdings = holdingsWithPrices.length > 0 ? holdingsWithPrices : baseHoldings;

  const isLoading = portfolioLoading || holdingsLoading;
  const error = portfolioError || holdingsError;

  const handleAddHolding = async () => {
    setIsAddingHolding(true);
    try {
      await holdingMutations.add(portfolioId, {
        symbol: newHolding.symbol.toUpperCase(),
        quantity: parseFloat(newHolding.quantity),
        averagePrice: parseFloat(newHolding.averagePrice),
        currentPrice: parseFloat(newHolding.currentPrice),
      });

      // Reset form
      setNewHolding({ symbol: '', quantity: '', averagePrice: '', currentPrice: '' });

      // Refresh holdings
      refreshHoldings();

      // Close dialog
      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
      closeButton?.click();
    } catch (error) {
      console.error('Failed to add holding:', error);
    } finally {
      setIsAddingHolding(false);
    }
  };

  // Calculate portfolio metrics
  const totalValue = holdingsData?.summary?.totalValue || 0;
  const totalReturn = holdingsData?.summary?.totalReturn || 0;
  const totalUnrealizedPnL = holdingsData?.summary?.totalUnrealizedPnL || 0;

  // Convert holdings to pie chart data
  const pieChartData = holdings.map((h: any) => ({
    name: h.symbol,
    value: h.marketValue || h.value,
    symbol: h.symbol,
    percentage: h.weight,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            포트폴리오를 불러오는 중 오류가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/portfolio" className="hover:text-primary">
            포트폴리오
          </Link>
          <span>/</span>
          <span>{portfolio.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {portfolio.name}
            </h1>
            {portfolio.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{portfolio.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AddTransactionDialog portfolioId={portfolioId} onSuccess={refreshHoldings} />
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              거래 내역
            </Button>
            <DownloadReportButton portfolioId={portfolioId} portfolioName={portfolio.name} />
            <Link href={`/portfolio/${portfolioId}/edit`}>
              <Button variant="outline">편집</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <ResponsiveCard className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">총 자산가치</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {totalValue.toLocaleString()} {portfolio.currency}
          </p>
        </ResponsiveCard>

        <ResponsiveCard className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">총 수익률</p>
          <p
            className={cn(
              'text-2xl font-bold mt-2',
              totalReturn >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {totalReturn >= 0 ? '+' : ''}
            {totalReturn.toFixed(2)}%
          </p>
        </ResponsiveCard>

        <ResponsiveCard className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">미실현 손익</p>
          <p
            className={cn(
              'text-2xl font-bold mt-2',
              totalUnrealizedPnL >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {totalUnrealizedPnL >= 0 ? '+' : ''}
            {totalUnrealizedPnL.toLocaleString()}
          </p>
        </ResponsiveCard>

        <ResponsiveCard className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">보유 종목</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {holdings.length}개
          </p>
        </ResponsiveCard>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="holdings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="holdings">보유 자산</TabsTrigger>
          <TabsTrigger value="performance">성과 분석</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {holdings.length > 0 && (
              <div className="lg:col-span-1">
                <AssetAllocationPieChart
                  data={pieChartData}
                  title="자산 배분"
                  subtitle="포트폴리오 구성 비중"
                  height={350}
                />
              </div>
            )}

            <div className={holdings.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  보유 자산
                </h2>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      자산 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 자산 추가</DialogTitle>
                      <DialogDescription>포트폴리오에 새로운 자산을 추가하세요</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="symbol">종목 코드</Label>
                        <Input
                          id="symbol"
                          placeholder="예: AAPL, 005930"
                          value={newHolding.symbol}
                          onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">수량</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="10"
                            value={newHolding.quantity}
                            onChange={(e) =>
                              setNewHolding({ ...newHolding, quantity: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="averagePrice">평균 매수가</Label>
                          <Input
                            id="averagePrice"
                            type="number"
                            placeholder="150.00"
                            value={newHolding.averagePrice}
                            onChange={(e) =>
                              setNewHolding({ ...newHolding, averagePrice: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentPrice">현재가</Label>
                        <Input
                          id="currentPrice"
                          type="number"
                          placeholder="175.00"
                          value={newHolding.currentPrice}
                          onChange={(e) =>
                            setNewHolding({ ...newHolding, currentPrice: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" data-dialog-close>
                          취소
                        </Button>
                        <Button
                          onClick={handleAddHolding}
                          disabled={
                            !newHolding.symbol ||
                            !newHolding.quantity ||
                            !newHolding.averagePrice ||
                            !newHolding.currentPrice ||
                            isAddingHolding
                          }
                        >
                          {isAddingHolding ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              추가 중...
                            </>
                          ) : (
                            '추가하기'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {holdings.length > 0 ? (
                <HoldingsTable
                  holdings={holdings}
                  onRowClick={(holding) => (window.location.href = `/stocks/${holding.symbol}`)}
                />
              ) : (
                <ResponsiveCard className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    보유 자산이 없습니다
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    자산을 추가하여 포트폴리오를 구성하세요
                  </p>
                </ResponsiveCard>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <ResponsiveCard className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              포트폴리오 성과
            </h2>

            {/* Mock returns data for now */}
            <ReturnsChart
              data={[
                {
                  date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  value: 10000000,
                  returns: 0,
                },
                {
                  date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                  value: 10200000,
                  returns: 2,
                },
                {
                  date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                  value: 10500000,
                  returns: 5,
                },
                {
                  date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                  value: 10300000,
                  returns: 3,
                },
                {
                  date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                  value: 10800000,
                  returns: 8,
                },
                {
                  date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                  value: 11000000,
                  returns: 10,
                },
                { date: new Date(), value: totalValue || 11200000, returns: totalReturn || 12 },
              ]}
              height={400}
              variant="area"
            />
          </ResponsiveCard>

          <div className="grid gap-6 md:grid-cols-2">
            <ResponsiveCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">월별 수익률</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">이번 달</span>
                  <span className="font-medium text-green-600">+5.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">지난 달</span>
                  <span className="font-medium text-green-600">+3.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">3개월 평균</span>
                  <span className="font-medium text-green-600">+4.2%</span>
                </div>
              </div>
            </ResponsiveCard>

            <ResponsiveCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">위험 지표</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">변동성</span>
                  <span className="font-medium">15.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">샤프 비율</span>
                  <span className="font-medium">1.85</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">최대 낙폭</span>
                  <span className="font-medium text-red-600">-8.5%</span>
                </div>
              </div>
            </ResponsiveCard>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <ResponsiveCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">거래 내역</h2>
              <AddTransactionDialog
                portfolioId={portfolioId}
                onSuccess={refreshHoldings}
                trigger={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    거래 추가
                  </Button>
                }
              />
            </div>

            <div className="text-center py-12 text-gray-500">거래 내역이 없습니다</div>
          </ResponsiveCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import React, { use } from 'react';
import { useMarketPrice, useMarketCandles, useRealtimePrice } from '@/hooks/useMarketData';
import { CandlestickChart, ReturnsChart } from '@/components/charts';
import { PriceTicker } from '@/components/realtime/PriceTicker';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Star, StarOff } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol } = use(params);
  const [interval, setInterval] = React.useState<'1m' | '5m' | '1h' | '1d'>('1h');
  const [isFavorite, setIsFavorite] = React.useState(false);

  const { price, isLoading: priceLoading } = useMarketPrice(symbol);
  const { candles, isLoading: candlesLoading } = useMarketCandles(symbol, interval);
  const { ticker } = useRealtimePrice(symbol);

  const isLoading = priceLoading || candlesLoading;

  // Calculate returns data from candles
  const returnsData = React.useMemo(() => {
    if (!candles || candles.length === 0) return [];

    const firstClose = candles[0].close;
    return candles.map((candle: any) => ({
      date: new Date(candle.timestamp),
      value: candle.close,
      returns: ((candle.close - firstClose) / firstClose) * 100,
    }));
  }, [candles]);

  if (!price && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/market" className="hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            시장 데이터
          </Link>
          <span>/</span>
          <span>{symbol}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{symbol}</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
                {isFavorite ? (
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </Button>
            </div>
            {price && <p className="text-gray-600 dark:text-gray-400 mt-1">{price.name}</p>}
          </div>

          {/* Real-time Price Ticker */}
          <div className="text-right">
            <PriceTicker symbol={symbol} variant="detailed" />
          </div>
        </div>
      </div>

      {/* Price Info Cards */}
      {price && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <ResponsiveCard className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">거래량</p>
            <p className="text-lg font-semibold mt-1">{price.volume.toLocaleString()}</p>
          </ResponsiveCard>

          <ResponsiveCard className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">24시간 최고</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1">
              {price.high24h?.toLocaleString()} {price.currency}
            </p>
          </ResponsiveCard>

          <ResponsiveCard className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">24시간 최저</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {price.low24h?.toLocaleString()} {price.currency}
            </p>
          </ResponsiveCard>

          <ResponsiveCard className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">변동률</p>
            <p
              className={cn(
                'text-lg font-semibold mt-1',
                price.changePercent >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {price.changePercent >= 0 ? '+' : ''}
              {price.changePercent.toFixed(2)}%
            </p>
          </ResponsiveCard>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="candle" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candle">캔들 차트</TabsTrigger>
          <TabsTrigger value="returns">수익률 차트</TabsTrigger>
        </TabsList>

        <TabsContent value="candle" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">가격 차트</h2>
            <div className="flex gap-2">
              {(['1m', '5m', '1h', '1d'] as const).map((int) => (
                <Button
                  key={int}
                  variant={interval === int ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInterval(int)}
                >
                  {int}
                </Button>
              ))}
            </div>
          </div>

          <ResponsiveCard className="p-6">
            {candlesLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <CandlestickChart data={candles} height={400} />
            )}
          </ResponsiveCard>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <ResponsiveCard className="p-6">
            {candlesLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <ReturnsChart data={returnsData} height={400} title="누적 수익률" variant="area" />
            )}
          </ResponsiveCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

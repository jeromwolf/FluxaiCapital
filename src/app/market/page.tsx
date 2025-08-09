'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { PriceTickerList } from '@/components/realtime/PriceTicker';
import { useMarketPrices } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveCard } from '@/components/ui/responsive-card';

// Popular stocks
const STOCK_GROUPS = {
  'US Tech': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'],
  Korean: ['005930', '000660', '035420', '035720', '005380', '051910', '006400'],
  Watchlist: ['NVDA', 'MSFT', 'GOOGL', '005930', '035420'],
};

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedGroup, setSelectedGroup] = React.useState<keyof typeof STOCK_GROUPS>('Watchlist');

  const symbols = STOCK_GROUPS[selectedGroup];
  const { prices, isLoading, error } = useMarketPrices(symbols, 5000); // Update every 5 seconds

  const filteredPrices = React.useMemo(() => {
    if (!searchTerm) return prices;

    return prices.filter(
      (price) =>
        price.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [prices, searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">시장 데이터</h1>
        <p className="text-gray-600 dark:text-gray-400">실시간 주식 가격 및 시장 동향</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="종목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stock Groups */}
      <Tabs
        value={selectedGroup}
        onValueChange={(v) => setSelectedGroup(v as keyof typeof STOCK_GROUPS)}
      >
        <TabsList>
          {Object.keys(STOCK_GROUPS).map((group) => (
            <TabsTrigger key={group} value={group}>
              {group}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedGroup} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400">
                시장 데이터를 불러오는 중 오류가 발생했습니다.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPrices.map((price) => (
                <Link key={price.symbol} href={`/stocks/${price.symbol}`}>
                  <ResponsiveCard className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {price.symbol}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{price.name}</p>
                        </div>
                        <span
                          className={cn(
                            'text-xs px-2 py-1 rounded',
                            price.changePercent >= 0
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                          )}
                        >
                          {price.changePercent >= 0 ? '+' : ''}
                          {price.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {price.price.toLocaleString()} {price.currency}
                        </p>
                        <p
                          className={cn(
                            'text-sm',
                            price.change >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {price.change >= 0 ? '+' : ''}
                          {price.change.toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">거래량</span>
                          <p className="font-medium">{price.volume.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">24시간</span>
                          <p className="font-medium">
                            {price.high24h?.toLocaleString()} / {price.low24h?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ResponsiveCard>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Real-time Price Tickers */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">실시간 가격 업데이트</h2>
        <ResponsiveCard className="p-6">
          <PriceTickerList symbols={['NVDA', 'AAPL', '005930', '035420']} variant="grid" />
        </ResponsiveCard>
      </div>
    </div>
  );
}

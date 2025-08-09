'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import Link from 'next/link';
import { useMarketPrices } from '@/hooks/useMarketData';

// 인기 종목 리스트
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
];

// 한국 주식
const koreanStocks = [
  { symbol: '005930', name: '삼성전자' },
  { symbol: '000660', name: 'SK하이닉스' },
  { symbol: '035420', name: 'NAVER' },
  { symbol: '035720', name: '카카오' },
  { symbol: '207940', name: '삼성바이오로직스' },
  { symbol: '005380', name: '현대차' },
  { symbol: '051910', name: 'LG화학' },
  { symbol: '006400', name: '삼성SDI' },
];

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<'US' | 'KR'>('US');

  const stockList = selectedMarket === 'US' ? popularStocks : koreanStocks;
  const symbols = stockList.map((s) => s.symbol);
  const { prices, isLoading } = useMarketPrices(symbols);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      window.location.href = `/stocks/${searchQuery.toUpperCase()}`;
    }
  };

  const filteredStocks = stockList.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">주식 시장</h1>
        <p className="text-gray-600 dark:text-gray-400">실시간 주가 정보와 차트를 확인하세요</p>
      </div>

      {/* 검색 바 */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="종목 코드 또는 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">검색</Button>
        </div>
      </form>

      {/* 시장 선택 탭 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedMarket === 'US' ? 'default' : 'outline'}
          onClick={() => setSelectedMarket('US')}
        >
          미국 시장
        </Button>
        <Button
          variant={selectedMarket === 'KR' ? 'default' : 'outline'}
          onClick={() => setSelectedMarket('KR')}
        >
          한국 시장
        </Button>
      </div>

      {/* 종목 리스트 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map((stock) => {
          const price = prices?.[stock.symbol as keyof typeof prices] as any;
          const changePercent = price?.changePercent || 0;
          const isPositive = changePercent >= 0;

          return (
            <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
              <ResponsiveCard className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                  </div>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>

                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                ) : price ? (
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      ${price.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {changePercent.toFixed(2)}%
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({isPositive ? '+' : ''}
                        {price.change.toFixed(2)})
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">가격 정보 없음</div>
                )}
              </ResponsiveCard>
            </Link>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealtimeQuote } from '@/hooks/useRealtimeQuotes';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/format';

interface RealtimeStockCardProps {
  symbol: string;
  className?: string;
  showDetails?: boolean;
  onClick?: () => void;
}

export function RealtimeStockCard({
  symbol,
  className,
  showDetails = false,
  onClick,
}: RealtimeStockCardProps) {
  const { quote, loading } = useRealtimeQuote(symbol);

  if (loading) {
    return (
      <div className={cn('p-4 rounded-lg border', className)}>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-24 mb-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!quote) return null;

  const isPositive = quote.changePercent >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border bg-white dark:bg-gray-800',
        'hover:shadow-md transition-all duration-200',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{quote.symbol}</h3>
            <Icon
              className={cn(
                'w-4 h-4',
                isPositive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{quote.nameKr || quote.name}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(quote.price, quote.currency)}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            )}
          >
            {isPositive ? '+' : ''}
            {quote.change.toLocaleString()} ({isPositive ? '+' : ''}
            {quote.changePercent}%)
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">거래량</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {quote.volume.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">시가총액</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(quote.marketCap, quote.currency, true)}
              </p>
            </div>
            {quote.per && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">PER</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {quote.per.toFixed(1)}
                </p>
              </div>
            )}
            {quote.dividend && quote.dividend > 0 && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">배당수익률</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {quote.dividend.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="mt-2 flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500 dark:text-gray-400">실시간</span>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRealtimePrice, useMarketPrice } from '@/hooks/useMarketData';

interface PriceTickerProps {
  symbol: string;
  className?: string;
  showVolume?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function PriceTicker({
  symbol,
  className,
  showVolume = false,
  variant = 'default',
}: PriceTickerProps) {
  // Use real-time price updates
  const { ticker, isConnected } = useRealtimePrice(symbol);
  // Use API price as fallback
  const { price: apiPrice } = useMarketPrice(!isConnected ? symbol : null);

  const priceData =
    ticker ||
    (apiPrice && {
      price: apiPrice.price,
      change: apiPrice.change,
      changePercent: apiPrice.changePercent,
      volume: apiPrice.volume,
      timestamp: apiPrice.updatedAt.getTime(),
    });

  const [flash, setFlash] = React.useState<'up' | 'down' | null>(null);
  const prevPriceRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (priceData && prevPriceRef.current !== null) {
      if (priceData.price > prevPriceRef.current) {
        setFlash('up');
      } else if (priceData.price < prevPriceRef.current) {
        setFlash('down');
      }

      const timeout = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timeout);
    }

    if (priceData) {
      prevPriceRef.current = priceData.price;
    }
  }, [priceData?.price]);

  if (!priceData) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    );
  }

  const isPositive = priceData.change >= 0;
  const Icon = isPositive ? TrendingUp : priceData.change < 0 ? TrendingDown : Minus;

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span
          className={cn(
            'font-medium transition-colors duration-300',
            flash === 'up' && 'text-green-600 dark:text-green-400',
            flash === 'down' && 'text-red-600 dark:text-red-400',
            !flash && 'text-gray-900 dark:text-gray-100',
          )}
        >
          {priceData.price.toLocaleString('ko-KR')}
        </span>
        <span
          className={cn(
            'text-sm',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}
        >
          {isPositive ? '+' : ''}
          {priceData.changePercent.toFixed(2)}%
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{symbol}</h3>
            <p
              className={cn(
                'text-2xl font-bold mt-1 transition-colors duration-300',
                flash === 'up' && 'text-green-600 dark:text-green-400',
                flash === 'down' && 'text-red-600 dark:text-red-400',
                !flash && 'text-gray-900 dark:text-gray-100',
              )}
            >
              {priceData.price.toLocaleString('ko-KR')}
            </p>
          </div>
          <div
            className={cn(
              'flex items-center space-x-1 px-2 py-1 rounded-lg',
              isPositive
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isPositive ? '+' : ''}
              {priceData.change.toLocaleString('ko-KR')}
            </span>
            <span className="text-sm">
              ({isPositive ? '+' : ''}
              {priceData.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {showVolume && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">거래량</span>
            <span className="text-gray-900 dark:text-gray-100">
              {priceData.volume.toLocaleString('ko-KR')}
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          마지막 업데이트: {new Date(priceData.timestamp).toLocaleTimeString('ko-KR')}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center space-x-3">
        <span className="font-medium text-gray-900 dark:text-gray-100">{symbol}</span>
        <span
          className={cn(
            'font-semibold transition-colors duration-300',
            flash === 'up' && 'text-green-600 dark:text-green-400',
            flash === 'down' && 'text-red-600 dark:text-red-400',
            !flash && 'text-gray-900 dark:text-gray-100',
          )}
        >
          {priceData.price.toLocaleString('ko-KR')}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Icon
          className={cn(
            'w-4 h-4',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}
        />
        <span
          className={cn(
            'text-sm font-medium',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
          )}
        >
          {isPositive ? '+' : ''}
          {priceData.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

// Multiple price tickers
interface PriceTickerListProps {
  symbols: string[];
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'grid';
}

export function PriceTickerList({
  symbols,
  className,
  variant = 'vertical',
}: PriceTickerListProps) {
  const containerClasses = cn(
    variant === 'horizontal' && 'flex space-x-6 overflow-x-auto',
    variant === 'vertical' && 'space-y-3',
    variant === 'grid' && 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    className,
  );

  return (
    <div className={containerClasses}>
      {symbols.map((symbol) => (
        <PriceTicker
          key={symbol}
          symbol={symbol}
          variant={variant === 'grid' ? 'detailed' : 'default'}
        />
      ))}
    </div>
  );
}

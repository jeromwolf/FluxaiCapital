'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { usePortfolioSubscription } from '@/hooks/useWebSocket';
import { PortfolioUpdate } from '@/lib/websocket/types';
import { SparklineChart } from '@/components/charts';

interface PortfolioStatusProps {
  className?: string;
  showChart?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function PortfolioStatus({ 
  className,
  showChart = true,
  variant = 'default'
}: PortfolioStatusProps) {
  const { portfolio, history, isConnected } = usePortfolioSubscription();
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    if (portfolio) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [portfolio?.timestamp]);

  if (!isConnected) {
    return (
      <div className={cn('p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800', className)}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            실시간 연결 대기 중...
          </span>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const isPositive = portfolio.dailyChange >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  // Convert history to chart data
  const chartData = history.slice(-20).map((update, index) => ({
    date: new Date(update.timestamp).toLocaleTimeString('ko-KR'),
    value: update.totalValue
  }));

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className="flex items-center space-x-3">
          <Activity className={cn(
            'w-4 h-4',
            pulse && 'animate-pulse',
            isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          )} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            총 자산
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {portfolio.totalValue.toLocaleString('ko-KR')} KRW
          </span>
        </div>
        <div className={cn(
          'text-sm font-medium',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {isPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            포트폴리오 실시간 현황
          </h3>
          <Activity className={cn(
            'w-5 h-5',
            pulse && 'animate-pulse',
            isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          )} />
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">총 자산 가치</p>
            <p className={cn(
              'text-2xl font-bold mt-1 transition-colors duration-300',
              pulse && (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
            )}>
              {portfolio.totalValue.toLocaleString('ko-KR')} KRW
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">일일 수익</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className={cn(
                'text-2xl font-bold',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {isPositive ? '+' : ''}{portfolio.dailyChange.toLocaleString('ko-KR')}
              </p>
              <span className={cn(
                'text-sm font-medium',
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                ({isPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        {showChart && chartData.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <SparklineChart
              data={chartData}
              className="w-full"
              color={isPositive ? '#10b981' : '#ef4444'}
            />
          </div>
        )}

        {/* Holdings */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            주요 보유 종목
          </h4>
          {portfolio.holdings.slice(0, 5).map(holding => (
            <div key={holding.symbol} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{holding.symbol}</span>
              <div className="flex items-center space-x-3">
                <span className="text-gray-900 dark:text-gray-100">
                  {holding.value.toLocaleString('ko-KR')}
                </span>
                <span className={cn(
                  'font-medium',
                  holding.changePercent >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          마지막 업데이트: {new Date(portfolio.timestamp).toLocaleTimeString('ko-KR')}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className={cn(
            'w-4 h-4',
            pulse && 'animate-pulse',
            isConnected ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
          )} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            실시간 포트폴리오
          </span>
        </div>
        <Icon className={cn(
          'w-5 h-5',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )} />
      </div>
      
      <div className="space-y-2">
        <div>
          <p className={cn(
            'text-2xl font-bold transition-colors duration-300',
            pulse && (isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
          )}>
            {portfolio.totalValue.toLocaleString('ko-KR')} KRW
          </p>
          <p className={cn(
            'text-sm',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            {isPositive ? '+' : ''}{portfolio.dailyChange.toLocaleString('ko-KR')} 
            ({isPositive ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%)
          </p>
        </div>
        
        {showChart && chartData.length > 0 && (
          <div className="h-12">
            <SparklineChart
              data={chartData}
              color={isPositive ? '#10b981' : '#ef4444'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
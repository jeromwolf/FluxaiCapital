'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendMiniChart, SparklineChart } from '@/components/charts';
import { formatReturns } from '@/lib/utils/returns-calculator';

export interface HoldingData {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  cost: number;
  returns: number;
  percentage: number;
  weight: number; // Portfolio weight percentage
  priceHistory?: Array<{ date: string; value: number }>;
  change24h?: number;
  change7d?: number;
}

interface HoldingsTableProps {
  holdings: HoldingData[];
  className?: string;
  loading?: boolean;
  onRowClick?: (holding: HoldingData) => void;
  sortBy?: keyof HoldingData;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: keyof HoldingData) => void;
}

export function HoldingsTable({
  holdings,
  className,
  loading = false,
  onRowClick,
  sortBy = 'weight',
  sortOrder = 'desc',
  onSort,
}: HoldingsTableProps) {
  const sortedHoldings = React.useMemo(() => {
    const sorted = [...holdings].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return sorted;
  }, [holdings, sortBy, sortOrder]);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalReturns = holdings.reduce((sum, h) => sum + h.returns, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.cost, 0);
  const totalPercentage = totalCost > 0 ? (totalReturns / totalCost) * 100 : 0;

  if (loading) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
          className,
        )}
      >
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
          className,
        )}
      >
        <div className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">보유 자산이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
        className,
      )}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <SortableHeader
                field="symbol"
                label="자산"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="left"
              />
              <SortableHeader
                field="quantity"
                label="수량"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                field="averagePrice"
                label="평균 매입가"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                field="currentPrice"
                label="현재가"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                field="value"
                label="평가액"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                field="returns"
                label="수익"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <SortableHeader
                field="weight"
                label="비중"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                align="right"
              />
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                추세
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedHoldings.map((holding) => {
              const {
                returnsText,
                percentageText,
                className: returnClass,
              } = formatReturns(holding.returns, holding.percentage);

              return (
                <tr
                  key={holding.id}
                  onClick={() => onRowClick?.(holding)}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {holding.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {holding.quantity.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {holding.averagePrice.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div>
                      <div className="text-gray-900 dark:text-gray-100">
                        {holding.currentPrice.toLocaleString('ko-KR')}
                      </div>
                      {holding.change24h !== undefined && (
                        <div
                          className={cn(
                            'text-xs',
                            holding.change24h >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {holding.change24h >= 0 ? '+' : ''}
                          {holding.change24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {holding.value.toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className={returnClass}>
                      <div>{returnsText}</div>
                      <div className="text-xs">{percentageText}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                    {holding.weight.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {holding.priceHistory && holding.priceHistory.length > 0 ? (
                      <SparklineChart data={holding.priceHistory} className="ml-auto" />
                    ) : (
                      <div className="w-24 h-8 bg-gray-100 dark:bg-gray-700 rounded" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <tr>
              <td
                colSpan={4}
                className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                합계
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                {totalValue.toLocaleString('ko-KR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div
                  className={
                    totalReturns >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  <div>
                    {totalReturns >= 0 ? '+' : ''}
                    {totalReturns.toLocaleString('ko-KR')}
                  </div>
                  <div className="text-xs">
                    {totalReturns >= 0 ? '+' : ''}
                    {totalPercentage.toFixed(2)}%
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                100.0%
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedHoldings.map((holding) => {
            const {
              returnsText,
              percentageText,
              className: returnClass,
            } = formatReturns(holding.returns, holding.percentage);

            return (
              <div
                key={holding.id}
                onClick={() => onRowClick?.(holding)}
                className={cn(
                  'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  onRowClick && 'cursor-pointer',
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {holding.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {holding.value.toLocaleString('ko-KR')} KRW
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {holding.weight.toFixed(1)}% 비중
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">수익: </span>
                    <span className={returnClass}>
                      {returnsText} ({percentageText})
                    </span>
                  </div>

                  {holding.priceHistory && holding.priceHistory.length > 0 && (
                    <TrendMiniChart data={holding.priceHistory} positive={holding.returns >= 0} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Summary */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">총 평가액</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {totalValue.toLocaleString('ko-KR')} KRW
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">총 수익</span>
            <span
              className={cn(
                'text-lg font-bold',
                totalReturns >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {totalReturns >= 0 ? '+' : ''}
              {totalReturns.toLocaleString('ko-KR')} ({totalReturns >= 0 ? '+' : ''}
              {totalPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  field: keyof HoldingData;
  label: string;
  sortBy?: keyof HoldingData;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: keyof HoldingData) => void;
  align?: 'left' | 'right';
}

function SortableHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = sortBy === field;

  return (
    <th
      className={cn(
        'px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        align === 'right' ? 'text-right' : 'text-left',
        onSort && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300',
      )}
      onClick={() => onSort?.(field)}
    >
      <div
        className={cn('inline-flex items-center gap-1', align === 'right' && 'flex-row-reverse')}
      >
        <span>{label}</span>
        {onSort && (
          <span
            className={cn(
              'transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50',
            )}
          >
            {isActive && sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

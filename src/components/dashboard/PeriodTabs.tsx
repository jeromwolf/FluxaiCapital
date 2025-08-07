'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface PeriodTabsProps {
  selected: Period;
  onChange: (period: Period) => void;
  className?: string;
  disabled?: boolean;
  periods?: Period[];
}

const defaultPeriods: Period[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const periodLabels: Record<Period, string> = {
  '1D': '1일',
  '1W': '1주',
  '1M': '1개월',
  '3M': '3개월',
  '6M': '6개월',
  '1Y': '1년',
  'ALL': '전체'
};

export function PeriodTabs({
  selected,
  onChange,
  className,
  disabled = false,
  periods = defaultPeriods
}: PeriodTabsProps) {
  return (
    <div className={cn(
      'inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1',
      className
    )}>
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          disabled={disabled}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
            selected === period
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {periodLabels[period]}
        </button>
      ))}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactPeriodTabs({
  selected,
  onChange,
  className,
  disabled = false,
  periods = ['1D', '1W', '1M', '1Y'] as Period[]
}: PeriodTabsProps) {
  return (
    <div className={cn(
      'inline-flex items-center space-x-1',
      className
    )}>
      {periods.map((period, index) => (
        <React.Fragment key={period}>
          <button
            onClick={() => onChange(period)}
            disabled={disabled}
            className={cn(
              'px-2 py-1 text-xs font-medium rounded transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
              selected === period
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {period}
          </button>
          {index < periods.length - 1 && (
            <span className="text-gray-300 dark:text-gray-600">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Mobile-friendly dropdown version
export function MobilePeriodSelect({
  selected,
  onChange,
  className,
  disabled = false,
  periods = defaultPeriods
}: PeriodTabsProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as Period)}
      disabled={disabled}
      className={cn(
        'block w-full px-3 py-2 text-sm',
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
        'rounded-md shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {periods.map((period) => (
        <option key={period} value={period}>
          {periodLabels[period]}
        </option>
      ))}
    </select>
  );
}

// Responsive wrapper that switches between tabs and select based on screen size
export function ResponsivePeriodTabs(props: PeriodTabsProps) {
  return (
    <>
      {/* Desktop: Show full tabs */}
      <div className="hidden sm:block">
        <PeriodTabs {...props} />
      </div>
      
      {/* Mobile: Show dropdown */}
      <div className="block sm:hidden">
        <MobilePeriodSelect {...props} />
      </div>
    </>
  );
}

// Hook to manage period state
export function usePeriod(initialPeriod: Period = '1M') {
  const [period, setPeriod] = React.useState<Period>(initialPeriod);
  
  const handlePeriodChange = React.useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
  }, []);
  
  return {
    period,
    setPeriod: handlePeriodChange
  };
}
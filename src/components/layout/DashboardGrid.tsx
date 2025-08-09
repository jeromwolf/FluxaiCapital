'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile, useIsTablet, useIsLargeDesktop } from '@/hooks/useMediaQuery';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'wide';
}

export function DashboardGrid({ children, className, variant = 'default' }: DashboardGridProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isLargeDesktop = useIsLargeDesktop();

  const gridClasses = cn(
    'grid gap-6',
    variant === 'default' && 'lg:grid-cols-12',
    variant === 'compact' && 'lg:grid-cols-8',
    variant === 'wide' && 'lg:grid-cols-16',
    isMobile && 'grid-cols-1 gap-4',
    isTablet && 'grid-cols-2 gap-4',
    className,
  );

  return <div className={gridClasses}>{children}</div>;
}

interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: {
    default?: number;
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  rowSpan?: number;
  order?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function GridItem({
  children,
  className,
  colSpan = { default: 12 },
  rowSpan = 1,
  order,
}: GridItemProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Determine col span based on device
  const getColSpan = () => {
    if (isMobile && colSpan.mobile) return colSpan.mobile;
    if (isTablet && colSpan.tablet) return colSpan.tablet;
    if (!isMobile && !isTablet && colSpan.desktop) return colSpan.desktop;
    return colSpan.default || 12;
  };

  // Determine order based on device
  const getOrder = () => {
    if (!order) return undefined;
    if (isMobile && order.mobile !== undefined) return order.mobile;
    if (isTablet && order.tablet !== undefined) return order.tablet;
    if (!isMobile && !isTablet && order.desktop !== undefined) return order.desktop;
    return undefined;
  };

  const span = getColSpan();
  const orderValue = getOrder();

  const itemClasses = cn(
    `lg:col-span-${span}`,
    rowSpan > 1 && `row-span-${rowSpan}`,
    orderValue !== undefined && `order-${orderValue}`,
    className,
  );

  return <div className={itemClasses}>{children}</div>;
}

// Preset layouts for common dashboard patterns
export function MetricsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}

export function TwoColumnLayout({
  left,
  right,
  leftWidth = 8,
  rightWidth = 4,
  className,
  reverseOnMobile = false,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: number;
  rightWidth?: number;
  className?: string;
  reverseOnMobile?: boolean;
}) {
  return (
    <DashboardGrid className={className}>
      <GridItem
        colSpan={{ default: leftWidth, mobile: 12 }}
        order={reverseOnMobile ? { mobile: 2, desktop: 1 } : undefined}
      >
        {left}
      </GridItem>
      <GridItem
        colSpan={{ default: rightWidth, mobile: 12 }}
        order={reverseOnMobile ? { mobile: 1, desktop: 2 } : undefined}
      >
        {right}
      </GridItem>
    </DashboardGrid>
  );
}

export function ThreeColumnLayout({
  left,
  center,
  right,
  className,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardGrid className={className}>
      <GridItem colSpan={{ default: 3, tablet: 6, mobile: 12 }}>{left}</GridItem>
      <GridItem colSpan={{ default: 6, tablet: 6, mobile: 12 }}>{center}</GridItem>
      <GridItem colSpan={{ default: 3, tablet: 12, mobile: 12 }}>{right}</GridItem>
    </DashboardGrid>
  );
}

// Widget container for dashboard items
interface DashboardWidgetProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  loading?: boolean;
  error?: string;
}

export function DashboardWidget({
  children,
  title,
  subtitle,
  action,
  className,
  noPadding = false,
  loading = false,
  error,
}: DashboardWidgetProps) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
          !noPadding && (isMobile ? 'p-4' : 'p-6'),
          className,
        )}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800',
          !noPadding && (isMobile ? 'p-4' : 'p-6'),
          className,
        )}
      >
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-sm font-medium">오류 발생</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        !noPadding && (isMobile ? 'p-4' : 'p-6'),
        className,
      )}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3
                className={cn(
                  'font-semibold text-gray-900 dark:text-gray-100',
                  isMobile ? 'text-base' : 'text-lg',
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                className={cn(
                  'text-gray-600 dark:text-gray-400',
                  isMobile ? 'text-xs mt-0.5' : 'text-sm mt-1',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

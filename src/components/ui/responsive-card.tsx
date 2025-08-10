'use client';

import React from 'react';

import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact' | 'prominent';
  noPadding?: boolean;
  onClick?: () => void;
}

export function ResponsiveCard({
  children,
  className,
  title,
  subtitle,
  action,
  variant = 'default',
  noPadding = false,
  onClick,
}: ResponsiveCardProps) {
  const isMobile = useIsMobile();

  const cardClasses = cn(
    'bg-white dark:bg-gray-800 transition-all duration-200',
    variant === 'default' && 'rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
    variant === 'compact' && 'rounded-md border border-gray-200 dark:border-gray-700',
    variant === 'prominent' && 'rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg',
    !noPadding && (isMobile ? 'p-4' : 'p-6'),
    onClick && 'cursor-pointer hover:shadow-md active:scale-[0.98]',
    className,
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      {(title || subtitle || action) && (
        <div
          className={cn(
            'flex items-start justify-between',
            !noPadding && children && (isMobile ? 'mb-4' : 'mb-6'),
          )}
        >
          <div className="flex-1">
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
          {action && (
            <div className={cn('flex-shrink-0', isMobile ? 'ml-2' : 'ml-4')}>{action}</div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Grid container for responsive cards
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveGrid({
  children,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 md:gap-6',
        `grid-cols-${columns.mobile || 1}`,
        `sm:grid-cols-${columns.tablet || 2}`,
        `lg:grid-cols-${columns.desktop || 3}`,
        className,
      )}
    >
      {children}
    </div>
  );
}

// Stack container for mobile-first layouts
interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  direction?: 'vertical' | 'horizontal';
}

export function ResponsiveStack({
  children,
  className,
  spacing = 'normal',
  direction = 'vertical',
}: ResponsiveStackProps) {
  const isMobile = useIsMobile();

  const stackClasses = cn(
    'flex',
    direction === 'vertical' ? 'flex-col' : 'flex-row',
    spacing === 'tight' && (isMobile ? 'gap-2' : 'gap-3'),
    spacing === 'normal' && (isMobile ? 'gap-4' : 'gap-6'),
    spacing === 'loose' && (isMobile ? 'gap-6' : 'gap-8'),
    className,
  );

  return <div className={stackClasses}>{children}</div>;
}

// Collapsible section for mobile
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className={className}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        {children}
      </div>
    );
  }

  return (
    <div className={cn('border-b border-gray-200 dark:border-gray-700', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <svg
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

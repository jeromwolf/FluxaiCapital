'use client';

import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  minHeight?: number;
  aspect?: number;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  isDark?: boolean;
}

export function ChartContainer({
  children,
  className,
  width = '100%',
  height = 400,
  minHeight = 200,
  aspect,
  title,
  subtitle,
  loading = false,
  error
}: ChartContainerProps) {
  // const theme = getChartTheme(isDark); // Unused for now

  if (loading) {
    return (
      <div className={cn('relative', className)}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div 
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          style={{ height: typeof height === 'number' ? height : minHeight }}
        >
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm">차트 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('relative', className)}>
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div 
          className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          style={{ height: typeof height === 'number' ? height : minHeight }}
        >
          <div className="text-center text-red-600 dark:text-red-400">
            <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-sm font-medium">차트 로딩 실패</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <ResponsiveContainer
          width={width}
          height={height}
          minHeight={minHeight}
          aspect={aspect}
        >
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Loading skeleton for charts
export function ChartSkeleton({ 
  height = 400, 
  className 
}: { 
  height?: number; 
  className?: string; 
}) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg" style={{ height }} />
    </div>
  );
}

// Chart error boundary
interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ChartContainer error={this.state.error?.message || '알 수 없는 오류가 발생했습니다'}>
            <div />
          </ChartContainer>
        )
      );
    }

    return this.props.children;
  }
}
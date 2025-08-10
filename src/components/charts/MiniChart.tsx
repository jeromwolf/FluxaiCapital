'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import { chartTheme } from '@/config/chart-theme';
import { cn } from '@/lib/utils';

interface MiniChartData {
  date: string;
  value: number;
  label?: string;
}

interface MiniChartProps {
  data: MiniChartData[];
  className?: string;
  width?: string | number;
  height?: string | number;
  type?: 'line' | 'area';
  color?: string;
  strokeWidth?: number;
  showAxis?: boolean;
  showTooltip?: boolean;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

const MiniTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
        <div>{data.label || data.date}</div>
        <div className="font-medium">{data.value?.toLocaleString('ko-KR')}</div>
      </div>
    );
  }
  return null;
};

export default function MiniChart({
  data,
  className,
  width = 200,
  height = 60,
  type = 'line',
  color,
  strokeWidth = 2,
  showAxis = false,
  showTooltip = true,
  loading = false,
  trend,
}: MiniChartProps) {
  // Auto-detect trend if not provided
  const detectedTrend =
    trend ||
    (() => {
      if (data.length < 2) return 'neutral';
      const first = data[0]?.value || 0;
      const last = data[data.length - 1]?.value || 0;
      if (last > first) return 'up';
      if (last < first) return 'down';
      return 'neutral';
    })();

  // Set color based on trend if not provided
  const chartColor =
    color ||
    (() => {
      switch (detectedTrend) {
        case 'up':
          return chartTheme.colors.success;
        case 'down':
          return chartTheme.colors.danger;
        default:
          return chartTheme.colors.primary;
      }
    })();

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded',
          className,
        )}
        style={{ width, height }}
      >
        <div className="animate-pulse flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-300 dark:bg-gray-600 rounded"
              style={{
                width: 4,
                height: Math.random() * 20 + 10,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded text-gray-400 dark:text-gray-600',
          className,
        )}
        style={{ width, height }}
      >
        <span className="text-xs">데이터 없음</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            {showAxis && (
              <>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: chartTheme.colors.text.secondary }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: chartTheme.colors.text.secondary }}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={strokeWidth}
              fill={chartColor}
              fillOpacity={0.2}
              dot={false}
              activeDot={false}
            />
            {showTooltip && <Tooltip content={<MiniTooltip />} />}
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            {showAxis && (
              <>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: chartTheme.colors.text.secondary }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: chartTheme.colors.text.secondary }}
                />
              </>
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartColor}
              strokeWidth={strokeWidth}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0, fill: chartColor }}
            />
            {showTooltip && <Tooltip content={<MiniTooltip />} />}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// Preset mini chart components for common use cases
export function TrendMiniChart({
  data,
  positive,
  className,
}: {
  data: MiniChartData[];
  positive?: boolean;
  className?: string;
}) {
  return (
    <MiniChart
      data={data}
      className={className}
      type="area"
      color={positive ? chartTheme.colors.success : chartTheme.colors.danger}
      height={40}
      width={80}
    />
  );
}

export function SparklineChart({
  data,
  className,
  color = chartTheme.colors.primary,
}: {
  data: MiniChartData[];
  className?: string;
  color?: string;
}) {
  return (
    <MiniChart
      data={data}
      className={className}
      type="line"
      color={color}
      height={30}
      width={100}
      strokeWidth={1.5}
      showTooltip={false}
    />
  );
}

export function PriceChart({
  data,
  trend,
  className,
}: {
  data: MiniChartData[];
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center space-x-2', className)}>
      <MiniChart
        data={data}
        type="line"
        trend={trend}
        height={24}
        width={60}
        strokeWidth={1.5}
        showTooltip={false}
      />
      {trend && (
        <span
          className={cn(
            'text-xs font-medium',
            trend === 'up' && 'text-green-600 dark:text-green-400',
            trend === 'down' && 'text-red-600 dark:text-red-400',
            trend === 'neutral' && 'text-gray-600 dark:text-gray-400',
          )}
        >
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </span>
      )}
    </div>
  );
}

// Chart with percentage change indicator
export function PerformanceChart({
  data,
  percentage,
  className,
}: {
  data: MiniChartData[];
  percentage: number;
  className?: string;
}) {
  const isPositive = percentage >= 0;

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <MiniChart
        data={data}
        type="area"
        color={isPositive ? chartTheme.colors.success : chartTheme.colors.danger}
        height={32}
        width={80}
      />
      <span
        className={cn(
          'text-sm font-medium',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        )}
      >
        {isPositive ? '+' : ''}
        {percentage.toFixed(2)}%
      </span>
    </div>
  );
}

// Loading skeleton for mini charts
export function MiniChartSkeleton({
  width = 200,
  height = 60,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('bg-gray-200 dark:bg-gray-700 animate-pulse rounded', className)}
      style={{ width, height }}
    />
  );
}

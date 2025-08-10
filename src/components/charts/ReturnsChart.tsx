'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

import { useChartTheme } from '@/hooks/useChartTheme';
import { cn } from '@/lib/utils';

interface ReturnsData {
  date: string | Date;
  value: number;
  returns?: number;
  benchmark?: number;
}

interface ReturnsChartProps {
  data: ReturnsData[];
  height?: number;
  showBenchmark?: boolean;
  variant?: 'line' | 'area';
  className?: string;
  title?: string;
}

export function ReturnsChart({
  data,
  height = 300,
  showBenchmark = false,
  variant = 'area',
  className,
  title,
}: ReturnsChartProps) {
  const theme = useChartTheme();

  // Calculate returns if not provided
  const chartData = React.useMemo(() => {
    if (data.length === 0) return [];

    const firstValue = data[0].value;
    return data.map((item, index) => {
      const returns =
        item.returns !== undefined ? item.returns : ((item.value - firstValue) / firstValue) * 100;

      return {
        ...item,
        date: format(new Date(item.date), 'MM/dd', { locale: ko }),
        returns: Number(returns.toFixed(2)),
        benchmark: item.benchmark || 0,
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500">차트 데이터가 없습니다</p>
      </div>
    );
  }

  const minReturns = Math.min(...chartData.map((d) => Math.min(d.returns, d.benchmark)));
  const maxReturns = Math.max(...chartData.map((d) => Math.max(d.returns, d.benchmark)));
  const yDomain = [Math.floor(minReturns * 1.1), Math.ceil(maxReturns * 1.1)];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload[0]) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span
                className={cn(
                  'text-sm font-medium',
                  entry.value >= 0 ? 'text-green-600' : 'text-red-600',
                )}
              >
                {entry.value >= 0 ? '+' : ''}
                {entry.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Chart = variant === 'area' ? AreaChart : LineChart;
  const DataComponent = variant === 'area' ? Area : Line;

  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <Chart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.grid} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: theme.colors.foreground }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 12, fill: theme.colors.foreground }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Zero line */}
          <ReferenceLine
            y={0}
            stroke={theme.colors.foreground}
            strokeDasharray="3 3"
            opacity={0.5}
          />

          <DataComponent
            type="monotone"
            dataKey="returns"
            name="수익률"
            stroke={theme.colors.primary}
            fill={theme.colors.primary}
            fillOpacity={variant === 'area' ? 0.3 : 0}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />

          {showBenchmark && (
            <DataComponent
              type="monotone"
              dataKey="benchmark"
              name="벤치마크"
              stroke={theme.colors.secondary}
              fill={theme.colors.secondary}
              fillOpacity={variant === 'area' ? 0.2 : 0}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}

          {showBenchmark && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />}
        </Chart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">현재 수익률</p>
          <p
            className={cn(
              'text-lg font-semibold mt-1',
              chartData[chartData.length - 1].returns >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {chartData[chartData.length - 1].returns >= 0 ? '+' : ''}
            {chartData[chartData.length - 1].returns}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">최고 수익률</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
            +{Math.max(...chartData.map((d) => d.returns)).toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">최저 수익률</p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400 mt-1">
            {Math.min(...chartData.map((d) => d.returns)).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

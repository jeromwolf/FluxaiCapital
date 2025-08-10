'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { useChartTheme, ChartTheme } from '@/hooks/useChartTheme';
import { MarketCandle } from '@/lib/market/types';
import { cn } from '@/lib/utils';

// Extend ChartTheme to include legacy properties
interface ExtendedChartTheme extends ChartTheme {
  gridColor: string;
  textColor: string;
  colors: {
    red: string;
    blue: string;
    gray: string;
    primary: string;
  } & ChartTheme['colors'];
}

interface CandlestickChartProps {
  data: MarketCandle[];
  height?: number;
  showVolume?: boolean;
  className?: string;
}

interface CandleData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isUp: boolean;
  body: [number, number];
  wick: [number, number];
}

// Transform candle data for Recharts
function transformCandleData(candles: MarketCandle[]): CandleData[] {
  return candles.map((candle) => {
    const isUp = candle.close >= candle.open;
    const body: [number, number] = isUp
      ? [candle.open, candle.close - candle.open]
      : [candle.close, candle.open - candle.close];
    const wick: [number, number] = [candle.low, candle.high - candle.low];

    return {
      ...candle,
      date: format(new Date(candle.timestamp), 'MM/dd HH:mm', { locale: ko }),
      isUp,
      body,
      wick,
    };
  });
}

export function CandlestickChart({
  data,
  height = 400,
  showVolume = true,
  className,
}: CandlestickChartProps) {
  const baseTheme = useChartTheme();

  // Extend theme with legacy properties for backwards compatibility
  const theme: ExtendedChartTheme = {
    ...baseTheme,
    gridColor: baseTheme.colors.grid,
    textColor: baseTheme.colors.foreground,
    colors: {
      ...baseTheme.colors,
      red: baseTheme.colors.candlestick.up,
      blue: baseTheme.colors.candlestick.down,
      gray: baseTheme.colors.muted,
    },
  };

  const candleData = transformCandleData(data);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-gray-500">차트 데이터가 없습니다</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.low)) * 0.995;
  const maxPrice = Math.max(...data.map((d) => d.high)) * 1.005;
  const maxVolume = Math.max(...data.map((d) => d.volume));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{data.date}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600 dark:text-gray-400">시가:</span>
            <span className="font-medium">{data.open.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600 dark:text-gray-400">고가:</span>
            <span className="font-medium">{data.high.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600 dark:text-gray-400">저가:</span>
            <span className="font-medium">{data.low.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600 dark:text-gray-400">종가:</span>
            <span className={cn('font-medium', data.isUp ? 'text-red-600' : 'text-blue-600')}>
              {data.close.toLocaleString()}
            </span>
          </div>
          {showVolume && (
            <div className="flex justify-between gap-4 pt-1 border-t">
              <span className="text-gray-600 dark:text-gray-400">거래량:</span>
              <span className="font-medium">{data.volume.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={candleData}
          margin={{ top: 10, right: 10, bottom: showVolume ? 80 : 10, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridColor} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: theme.textColor }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 12, fill: theme.textColor }}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Wicks */}
          <Bar dataKey="wick" fill="transparent" isAnimationActive={false}>
            {candleData.map((entry, index) => (
              <Cell
                key={`wick-${index}`}
                fill={entry.isUp ? theme.colors.candlestick.up : theme.colors.candlestick.down}
              />
            ))}
          </Bar>

          {/* Bodies */}
          <Bar dataKey="body" fill="transparent" isAnimationActive={false} barSize={10}>
            {candleData.map((entry, index) => (
              <Cell
                key={`body-${index}`}
                fill={entry.isUp ? theme.colors.candlestick.up : theme.colors.candlestick.down}
              />
            ))}
          </Bar>

          {/* Volume bars at bottom if enabled */}
          {showVolume && (
            <Bar
              dataKey="volume"
              fill={theme.colors.muted}
              opacity={0.3}
              yAxisId="volume"
              barSize={10}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {showVolume && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={candleData} margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
              <Bar dataKey="volume" fill={theme.colors.primary} opacity={0.5}>
                {candleData.map((entry, index) => (
                  <Cell
                    key={`vol-${index}`}
                    fill={entry.isUp ? theme.colors.candlestick.up : theme.colors.candlestick.down}
                    opacity={0.5}
                  />
                ))}
              </Bar>
              <XAxis dataKey="date" hide />
              <YAxis
                domain={[0, maxVolume * 1.1]}
                tick={{ fontSize: 10, fill: theme.textColor }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

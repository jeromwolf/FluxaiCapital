'use client';

import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { chartTheme } from '@/config/chart-theme';
import { usePriceSubscription } from '@/hooks/useWebSocket';
import { ChartContainer } from '@/components/charts';

interface RealtimeChartProps {
  symbol: string;
  className?: string;
  height?: number;
  type?: 'line' | 'area';
  showAxis?: boolean;
  maxDataPoints?: number;
  updateInterval?: number;
}

export function RealtimeChart({
  symbol,
  className,
  height = 300,
  type = 'area',
  showAxis = true,
  maxDataPoints = 100,
  updateInterval = 1000
}: RealtimeChartProps) {
  const prices = usePriceSubscription([symbol]);
  const priceData = prices[symbol];
  
  const [chartData, setChartData] = React.useState<Array<{
    time: string;
    price: number;
  }>>([]);

  React.useEffect(() => {
    if (priceData) {
      setChartData(prev => {
        const newData = [
          ...prev,
          {
            time: new Date(priceData.timestamp).toLocaleTimeString('ko-KR'),
            price: priceData.price
          }
        ].slice(-maxDataPoints);
        
        return newData;
      });
    }
  }, [priceData, maxDataPoints]);

  const isPositive = priceData ? priceData.change >= 0 : true;
  const color = isPositive ? chartTheme.colors.success : chartTheme.colors.danger;

  const Chart = type === 'line' ? LineChart : AreaChart;
  const DataComponent = type === 'line' ? Line : Area;

  return (
    <ChartContainer
      title={`${symbol} 실시간 차트`}
      subtitle={priceData ? `현재가: ${priceData.price.toLocaleString('ko-KR')} KRW` : '데이터 대기 중...'}
      height={height}
      className={className}
      loading={!priceData}
    >
      <Chart data={chartData}>
        {showAxis && (
          <>
            <XAxis 
              dataKey="time" 
              stroke={chartTheme.colors.text.secondary}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke={chartTheme.colors.text.secondary}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(value) => value.toLocaleString('ko-KR')}
            />
          </>
        )}
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelStyle={{ color: '#fff', fontSize: '12px' }}
          itemStyle={{ color: '#fff', fontSize: '12px' }}
          formatter={(value: number) => value.toLocaleString('ko-KR')}
        />
        
        <DataComponent
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={2}
          fill={type === 'area' ? color : undefined}
          fillOpacity={type === 'area' ? 0.1 : undefined}
          dot={false}
          animationDuration={300}
        />
      </Chart>
    </ChartContainer>
  );
}

// Multi-symbol real-time chart
interface MultiSymbolRealtimeChartProps {
  symbols: string[];
  className?: string;
  height?: number;
  maxDataPoints?: number;
}

export function MultiSymbolRealtimeChart({
  symbols,
  className,
  height = 400,
  maxDataPoints = 100
}: MultiSymbolRealtimeChartProps) {
  const prices = usePriceSubscription(symbols);
  const [chartData, setChartData] = React.useState<Array<any>>([]);
  const [normalizedPrices, setNormalizedPrices] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const timestamp = Date.now();
    const dataPoint: any = {
      time: new Date(timestamp).toLocaleTimeString('ko-KR')
    };

    let hasData = false;
    symbols.forEach(symbol => {
      if (prices[symbol]) {
        // Normalize prices to percentage change from initial value
        if (!normalizedPrices[symbol]) {
          setNormalizedPrices(prev => ({
            ...prev,
            [symbol]: prices[symbol].price
          }));
        }
        
        const basePrice = normalizedPrices[symbol] || prices[symbol].price;
        const percentageChange = ((prices[symbol].price - basePrice) / basePrice) * 100;
        
        dataPoint[symbol] = percentageChange;
        hasData = true;
      }
    });

    if (hasData) {
      setChartData(prev => [...prev, dataPoint].slice(-maxDataPoints));
    }
  }, [prices, symbols, normalizedPrices, maxDataPoints]);

  const colors = [
    chartTheme.colors.primary,
    chartTheme.colors.secondary,
    chartTheme.colors.success,
    chartTheme.colors.warning,
    chartTheme.colors.danger
  ];

  return (
    <ChartContainer
      title="실시간 상대 성과"
      subtitle="초기값 대비 변화율 (%)"
      height={height}
      className={className}
      loading={chartData.length === 0}
    >
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
          stroke={chartTheme.colors.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={chartTheme.colors.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toFixed(2)}%`}
        />
        
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px'
          }}
          labelStyle={{ color: '#fff', fontSize: '12px' }}
          itemStyle={{ fontSize: '12px' }}
          formatter={(value: number) => `${value.toFixed(2)}%`}
        />
        
        {symbols.map((symbol, index) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
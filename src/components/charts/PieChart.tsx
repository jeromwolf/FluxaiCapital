'use client';

import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './ChartContainer';
import { chartTheme, pieChartConfig } from '@/config/chart-theme';

interface PieChartData {
  name: string;
  value: number;
  symbol?: string;
  percentage?: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  showLegend?: boolean;
  showLabels?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  loading?: boolean;
  error?: string;
  isDark?: boolean;
  onSegmentClick?: (data: PieChartData, index: number) => void;
}

const defaultColors = chartTheme.colors.chart;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {data.name}
          </span>
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          <div>가치: {data.value?.toLocaleString('ko-KR')} KRW</div>
          {data.percentage && (
            <div>비중: {data.percentage.toFixed(1)}%</div>
          )}
          {data.symbol && (
            <div>심볼: {data.symbol}</div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  if (percentage < 3) return null; // Hide labels for very small segments
  
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={chartTheme.colors.text.primary}
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={chartTheme.fonts.sizes.sm}
      fontFamily={chartTheme.fonts.family}
      className="dark:fill-gray-100"
    >
      {`${percentage.toFixed(1)}%`}
    </text>
  );
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PieChart({
  data,
  title,
  subtitle,
  className,
  width = '100%',
  height = 400,
  showLegend = true,
  showLabels = true,
  showTooltip = true,
  innerRadius = 60,
  outerRadius = 120,
  loading = false,
  error,
  isDark = false,
  onSegmentClick
}: PieChartProps) {
  // Calculate percentages and assign colors
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const processedData = data.map((item, index) => ({
    ...item,
    percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    color: item.color || defaultColors[index % defaultColors.length]
  }));

  const handleSegmentClick = (data: any, index: number) => {
    if (onSegmentClick) {
      onSegmentClick(data, index);
    }
  };

  if (loading || error) {
    return (
      <ChartContainer
        title={title}
        subtitle={subtitle}
        className={className}
        width={width}
        height={height}
        loading={loading}
        error={error}
        isDark={isDark}
      >
        <div /> {/* Empty div for ResponsiveContainer */}
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer
        title={title}
        subtitle={subtitle}
        className={className}
        width={width}
        height={height}
        error="표시할 데이터가 없습니다"
        isDark={isDark}
      >
        <div />
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      className={className}
      width={width}
      height={height}
      isDark={isDark}
    >
      <RechartsPieChart>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? CustomLabel : false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
          onClick={handleSegmentClick}
          style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
        >
          {processedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          ))}
        </Pie>
        
        {showTooltip && (
          <Tooltip content={<CustomTooltip />} />
        )}
        
        {showLegend && (
          <Legend content={<CustomLegend />} />
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
}

// Preset configurations for common use cases
export const AssetAllocationPieChart = (props: Omit<PieChartProps, 'innerRadius' | 'outerRadius'>) => (
  <PieChart 
    {...props}
    innerRadius={50}
    outerRadius={110}
    title={props.title || "자산 배분"}
  />
);

export const PortfolioDistributionPieChart = (props: Omit<PieChartProps, 'innerRadius'>) => (
  <PieChart 
    {...props}
    innerRadius={0}
    title={props.title || "포트폴리오 분포"}
  />
);

export const CompactPieChart = (props: Omit<PieChartProps, 'height' | 'showLegend' | 'showLabels'>) => (
  <PieChart 
    {...props}
    height={250}
    showLegend={false}
    showLabels={false}
    innerRadius={40}
    outerRadius={80}
  />
);
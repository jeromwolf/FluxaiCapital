'use client';

import React from 'react';
import { 
  ChartType, 
  TimeFrame, 
  IndicatorType, 
  DrawingTool 
} from '@/lib/charting/trading-view-chart';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Minus,
  Grid,
  BarChart3,
  Activity,
  Trash2,
  Download,
  Upload,
  Settings,
  Maximize2,
} from 'lucide-react';

interface ChartToolbarProps {
  chartType: ChartType;
  timeframe: TimeFrame;
  indicators: Map<string, { type: IndicatorType; enabled: boolean }>;
  selectedTool: DrawingTool | null;
  showGrid: boolean;
  showVolume: boolean;
  logScale: boolean;
  onChartTypeChange: (type: ChartType) => void;
  onTimeframeChange: (timeframe: TimeFrame) => void;
  onIndicatorToggle: (type: IndicatorType) => void;
  onDrawingToolSelect: (tool: DrawingTool | null) => void;
  onGridToggle: () => void;
  onVolumeToggle: () => void;
  onLogScaleToggle: () => void;
  onClearDrawings: () => void;
  onFullscreen?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onSettings?: () => void;
}

const timeframes: { value: TimeFrame; label: string }[] = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '30m', label: '30분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '1일' },
  { value: '1w', label: '1주' },
  { value: '1M', label: '1개월' },
];

const chartTypes: { value: ChartType; label: string; icon: React.ReactNode }[] = [
  { value: 'candlestick', label: '캔들스틱', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'heikinashi', label: '하이킨아시', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'line', label: '라인', icon: <Activity className="w-4 h-4" /> },
  { value: 'bar', label: '바', icon: <BarChart3 className="w-4 h-4" /> },
  { value: 'area', label: '영역', icon: <Activity className="w-4 h-4" /> },
];

const indicators: { type: IndicatorType; label: string; description: string }[] = [
  { type: 'MA', label: 'MA', description: '이동평균' },
  { type: 'EMA', label: 'EMA', description: '지수이동평균' },
  { type: 'BB', label: 'BB', description: '볼린저밴드' },
  { type: 'RSI', label: 'RSI', description: '상대강도지수' },
  { type: 'MACD', label: 'MACD', description: 'MACD' },
  { type: 'STOCH', label: 'Stoch', description: '스토캐스틱' },
  { type: 'ATR', label: 'ATR', description: 'ATR' },
];

const drawingTools: { tool: DrawingTool; label: string; icon: React.ReactNode }[] = [
  { tool: 'trend', label: '추세선', icon: <TrendingUp className="w-4 h-4" /> },
  { tool: 'horizontal', label: '수평선', icon: <Minus className="w-4 h-4" /> },
  { tool: 'vertical', label: '수직선', icon: <Minus className="w-4 h-4 rotate-90" /> },
  { tool: 'fib', label: '피보나치', icon: <BarChart3 className="w-4 h-4" /> },
  { tool: 'rect', label: '사각형', icon: <Grid className="w-4 h-4" /> },
];

export function ChartToolbar({
  chartType,
  timeframe,
  indicators: activeIndicators,
  selectedTool,
  showGrid,
  showVolume,
  logScale,
  onChartTypeChange,
  onTimeframeChange,
  onIndicatorToggle,
  onDrawingToolSelect,
  onGridToggle,
  onVolumeToggle,
  onLogScaleToggle,
  onClearDrawings,
  onFullscreen,
  onExport,
  onImport,
  onSettings,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          {timeframes.map(tf => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                timeframe === tf.value
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Chart type selector */}
        <div className="flex items-center gap-1">
          {chartTypes.map(type => (
            <button
              key={type.value}
              onClick={() => onChartTypeChange(type.value)}
              className={cn(
                "p-1.5 rounded transition-colors",
                chartType === type.value
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={type.label}
            >
              {type.icon}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Indicators */}
        <div className="flex items-center gap-1">
          {indicators.map(indicator => (
            <button
              key={indicator.type}
              onClick={() => onIndicatorToggle(indicator.type)}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                activeIndicators.get(indicator.type)?.enabled
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={indicator.description}
            >
              {indicator.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Drawing tools */}
        <div className="flex items-center gap-1">
          {drawingTools.map(({ tool, label, icon }) => (
            <button
              key={tool}
              onClick={() => onDrawingToolSelect(selectedTool === tool ? null : tool)}
              className={cn(
                "p-1.5 rounded transition-colors",
                selectedTool === tool
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              title={label}
            >
              {icon}
            </button>
          ))}
          
          <button
            onClick={onClearDrawings}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="모든 그리기 지우기"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* View options */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGridToggle}
            className={cn(
              "p-1.5 rounded transition-colors",
              showGrid
                ? "bg-gray-700 text-white dark:bg-gray-600"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            title="그리드"
          >
            <Grid className="w-4 h-4" />
          </button>
          
          <button
            onClick={onVolumeToggle}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              showVolume
                ? "bg-gray-700 text-white dark:bg-gray-600"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            거래량
          </button>
          
          <button
            onClick={onLogScaleToggle}
            className={cn(
              "px-2 py-1 text-xs rounded transition-colors",
              logScale
                ? "bg-gray-700 text-white dark:bg-gray-600"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            로그
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {onExport && (
            <button
              onClick={onExport}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="차트 내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          
          {onImport && (
            <button
              onClick={onImport}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="차트 가져오기"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
          
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="전체화면"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
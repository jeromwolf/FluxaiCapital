'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MarketCandle } from '@/lib/market/types';
import {
  ChartType,
  TimeFrame,
  IndicatorType,
  DrawingTool,
  ChartConfig,
  ChartDrawing,
  ChartPoint,
  TechnicalIndicators,
  FibonacciLevels,
  HeikinAshi,
  TimeFrameConverter,
  IndicatorConfig,
} from '@/lib/charting/trading-view-chart';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TradingViewChartProps {
  data: MarketCandle[];
  symbol?: string;
  height?: number;
  className?: string;
  onDataRequest?: (timeframe: TimeFrame, from: number, to: number) => Promise<MarketCandle[]>;
}

interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
}

interface ChartScale {
  priceScale: (price: number) => number;
  timeScale: (time: number) => number;
  invertPriceScale: (y: number) => number;
  invertTimeScale: (x: number) => number;
}

export function TradingViewChart({
  data: initialData,
  symbol = 'BTCUSDT',
  height = 600,
  className,
  onDataRequest,
}: TradingViewChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<MarketCandle[]>(initialData);
  const [config, setConfig] = useState<ChartConfig>({
    type: 'candlestick',
    timeframe: '1h',
    indicators: new Map([
      ['volume', { type: 'VOLUME', enabled: true }],
    ]),
    drawings: [],
    showVolume: true,
    showGrid: true,
    showCrosshair: true,
    autoScale: true,
    logScale: false,
  });
  
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 800,
    height: height,
    margin: { top: 20, right: 80, bottom: 80, left: 20 },
    plotWidth: 700,
    plotHeight: 500,
  });

  const [scale, setScale] = useState<ChartScale | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingTool | null>(null);
  const [currentDrawing, setCurrentDrawing] = useState<ChartPoint[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Processed chart data based on chart type
  const processedData = useMemo(() => {
    if (config.type === 'heikinashi') {
      return HeikinAshi.convert(data);
    }
    return data;
  }, [data, config.type]);

  // Calculate dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const margin = { top: 20, right: 80, bottom: config.showVolume ? 120 : 60, left: 20 };
        setDimensions({
          width,
          height,
          margin,
          plotWidth: width - margin.left - margin.right,
          plotHeight: height - margin.top - margin.bottom,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height, config.showVolume]);

  // Calculate scales
  useEffect(() => {
    if (processedData.length === 0) return;

    const prices = processedData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;
    
    const times = processedData.map(d => d.timestamp);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const priceRange = maxPrice - minPrice;
    const timeRange = maxTime - minTime;

    const priceScale = (price: number) => {
      const normalized = config.logScale
        ? (Math.log(price) - Math.log(minPrice)) / (Math.log(maxPrice) - Math.log(minPrice))
        : (price - minPrice) / priceRange;
      return dimensions.margin.top + dimensions.plotHeight * (1 - normalized);
    };

    const timeScale = (time: number) => {
      const normalized = (time - minTime) / timeRange;
      return dimensions.margin.left + normalized * dimensions.plotWidth;
    };

    const invertPriceScale = (y: number) => {
      const normalized = 1 - (y - dimensions.margin.top) / dimensions.plotHeight;
      if (config.logScale) {
        return Math.exp(Math.log(minPrice) + normalized * (Math.log(maxPrice) - Math.log(minPrice)));
      }
      return minPrice + normalized * priceRange;
    };

    const invertTimeScale = (x: number) => {
      const normalized = (x - dimensions.margin.left) / dimensions.plotWidth;
      return minTime + normalized * timeRange;
    };

    setScale({ priceScale, timeScale, invertPriceScale, invertTimeScale });
  }, [processedData, dimensions, config.logScale, zoom, pan]);

  // Drawing functions
  const drawCandle = useCallback((ctx: CanvasRenderingContext2D, candle: MarketCandle, scale: ChartScale) => {
    const x = scale.timeScale(candle.timestamp);
    const openY = scale.priceScale(candle.open);
    const closeY = scale.priceScale(candle.close);
    const highY = scale.priceScale(candle.high);
    const lowY = scale.priceScale(candle.low);

    const isUp = candle.close >= candle.open;
    const color = isUp ? '#22c55e' : '#ef4444';
    const candleWidth = Math.max(1, Math.min(10, dimensions.plotWidth / processedData.length * 0.8));

    // Draw wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();

    // Draw body
    ctx.fillStyle = isUp ? color : color;
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(openY - closeY);
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 1);
    
    if (!isUp) {
      ctx.strokeStyle = color;
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 1);
    }
  }, [dimensions.plotWidth, processedData.length]);

  const drawLine = useCallback((ctx: CanvasRenderingContext2D, data: MarketCandle[], scale: ChartScale) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((candle, i) => {
      const x = scale.timeScale(candle.timestamp);
      const y = scale.priceScale(candle.close);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, []);

  const drawVolume = useCallback((ctx: CanvasRenderingContext2D, data: MarketCandle[], scale: ChartScale) => {
    if (!config.showVolume) return;

    const volumeHeight = 60;
    const volumeTop = dimensions.height - dimensions.margin.bottom - volumeHeight;
    const maxVolume = Math.max(...data.map(d => d.volume));

    data.forEach((candle, i) => {
      const x = scale.timeScale(candle.timestamp);
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const isUp = candle.close >= candle.open;
      
      ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      const barWidth = Math.max(1, dimensions.plotWidth / data.length * 0.8);
      ctx.fillRect(
        x - barWidth / 2,
        volumeTop + volumeHeight - volumeBarHeight,
        barWidth,
        volumeBarHeight
      );
    });
  }, [config.showVolume, dimensions]);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, scale: ChartScale) => {
    if (!config.showGrid) return;

    ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
    ctx.lineWidth = 1;

    // Price grid lines
    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const y = dimensions.margin.top + (dimensions.plotHeight * i) / priceSteps;
      ctx.beginPath();
      ctx.moveTo(dimensions.margin.left, y);
      ctx.lineTo(dimensions.width - dimensions.margin.right, y);
      ctx.stroke();

      // Price labels
      const price = scale.invertPriceScale(y);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), dimensions.width - 10, y + 4);
    }

    // Time grid lines
    const timeSteps = 6;
    for (let i = 0; i <= timeSteps; i++) {
      const x = dimensions.margin.left + (dimensions.plotWidth * i) / timeSteps;
      ctx.beginPath();
      ctx.moveTo(x, dimensions.margin.top);
      ctx.lineTo(x, dimensions.height - dimensions.margin.bottom);
      ctx.stroke();

      // Time labels
      if (i < timeSteps) {
        const time = scale.invertTimeScale(x);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(
          format(new Date(time), 'MM/dd HH:mm', { locale: ko }),
          x,
          dimensions.height - dimensions.margin.bottom + 20
        );
      }
    }
  }, [config.showGrid, dimensions]);

  const drawCrosshair = useCallback((ctx: CanvasRenderingContext2D, scale: ChartScale) => {
    if (!config.showCrosshair || !mousePos) return;

    ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(mousePos.x, dimensions.margin.top);
    ctx.lineTo(mousePos.x, dimensions.height - dimensions.margin.bottom);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(dimensions.margin.left, mousePos.y);
    ctx.lineTo(dimensions.width - dimensions.margin.right, mousePos.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // Price label
    const price = scale.invertPriceScale(mousePos.y);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(dimensions.width - dimensions.margin.right, mousePos.y - 10, dimensions.margin.right, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(price.toFixed(2), dimensions.width - dimensions.margin.right / 2, mousePos.y + 4);

    // Time label
    const time = scale.invertTimeScale(mousePos.x);
    const timeStr = format(new Date(time), 'MM/dd HH:mm', { locale: ko });
    const textWidth = ctx.measureText(timeStr).width;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(mousePos.x - textWidth / 2 - 5, dimensions.height - dimensions.margin.bottom, textWidth + 10, 20);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(timeStr, mousePos.x, dimensions.height - dimensions.margin.bottom + 14);
  }, [config.showCrosshair, mousePos, dimensions]);

  const drawIndicator = useCallback((
    ctx: CanvasRenderingContext2D,
    indicator: IndicatorConfig,
    data: MarketCandle[],
    scale: ChartScale
  ) => {
    const closes = data.map(d => d.close);
    
    switch (indicator.type) {
      case 'MA':
      case 'SMA': {
        const ma = TechnicalIndicators.SMA(closes, indicator.period || 20);
        ctx.strokeStyle = indicator.color || '#3b82f6';
        ctx.lineWidth = indicator.lineWidth || 2;
        ctx.beginPath();
        
        data.forEach((candle, i) => {
          if (ma[i] !== null) {
            const x = scale.timeScale(candle.timestamp);
            const y = scale.priceScale(ma[i]!);
            if (i === 0 || ma[i - 1] === null) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        break;
      }
      
      case 'EMA': {
        const ema = TechnicalIndicators.EMA(closes, indicator.period || 20);
        ctx.strokeStyle = indicator.color || '#10b981';
        ctx.lineWidth = indicator.lineWidth || 2;
        ctx.beginPath();
        
        data.forEach((candle, i) => {
          if (ema[i] !== null) {
            const x = scale.timeScale(candle.timestamp);
            const y = scale.priceScale(ema[i]!);
            if (i === 0 || ema[i - 1] === null) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        break;
      }
      
      case 'BB': {
        const bb = TechnicalIndicators.BollingerBands(closes, indicator.period || 20, indicator.standardDeviations || 2);
        
        // Upper band
        ctx.strokeStyle = indicator.color || 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        data.forEach((candle, i) => {
          if (bb.upper[i] !== null) {
            const x = scale.timeScale(candle.timestamp);
            const y = scale.priceScale(bb.upper[i]!);
            if (i === 0 || bb.upper[i - 1] === null) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        
        // Middle band
        ctx.strokeStyle = indicator.color || 'rgba(59, 130, 246, 0.5)';
        ctx.beginPath();
        data.forEach((candle, i) => {
          if (bb.middle[i] !== null) {
            const x = scale.timeScale(candle.timestamp);
            const y = scale.priceScale(bb.middle[i]!);
            if (i === 0 || bb.middle[i - 1] === null) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        
        // Lower band
        ctx.strokeStyle = indicator.color || 'rgba(34, 197, 94, 0.5)';
        ctx.beginPath();
        data.forEach((candle, i) => {
          if (bb.lower[i] !== null) {
            const x = scale.timeScale(candle.timestamp);
            const y = scale.priceScale(bb.lower[i]!);
            if (i === 0 || bb.lower[i - 1] === null) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        break;
      }
    }
  }, []);

  const drawDrawings = useCallback((ctx: CanvasRenderingContext2D, scale: ChartScale) => {
    config.drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color || '#3b82f6';
      ctx.lineWidth = drawing.lineWidth || 2;
      
      switch (drawing.type) {
        case 'trend': {
          if (drawing.points.length >= 2) {
            ctx.beginPath();
            const start = drawing.points[0];
            const end = drawing.points[1];
            ctx.moveTo(scale.timeScale(start.x), scale.priceScale(start.y));
            ctx.lineTo(scale.timeScale(end.x), scale.priceScale(end.y));
            ctx.stroke();
          }
          break;
        }
        
        case 'horizontal': {
          if (drawing.points.length >= 1) {
            ctx.beginPath();
            const y = scale.priceScale(drawing.points[0].y);
            ctx.moveTo(dimensions.margin.left, y);
            ctx.lineTo(dimensions.width - dimensions.margin.right, y);
            ctx.stroke();
            
            // Price label
            ctx.fillStyle = drawing.color || '#3b82f6';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(drawing.points[0].y.toFixed(2), dimensions.width - dimensions.margin.right - 5, y - 5);
          }
          break;
        }
        
        case 'fib': {
          if (drawing.points.length >= 2 && drawing.levels) {
            const high = Math.max(drawing.points[0].y, drawing.points[1].y);
            const low = Math.min(drawing.points[0].y, drawing.points[1].y);
            const levels = FibonacciLevels.calculate(high, low);
            
            levels.forEach(({ price, label }) => {
              const y = scale.priceScale(price);
              ctx.strokeStyle = 'rgba(156, 163, 175, 0.5)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(dimensions.margin.left, y);
              ctx.lineTo(dimensions.width - dimensions.margin.right, y);
              ctx.stroke();
              
              ctx.fillStyle = '#6b7280';
              ctx.font = '11px Inter';
              ctx.textAlign = 'right';
              ctx.fillText(`${label} - ${price.toFixed(2)}`, dimensions.width - dimensions.margin.right - 5, y - 3);
            });
          }
          break;
        }
      }
    });
    
    // Draw current drawing in progress
    if (selectedTool && currentDrawing.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      if (selectedTool === 'trend' && currentDrawing.length === 1 && mousePos) {
        ctx.beginPath();
        ctx.moveTo(scale.timeScale(currentDrawing[0].x), scale.priceScale(currentDrawing[0].y));
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
    }
  }, [config.drawings, selectedTool, currentDrawing, mousePos, dimensions]);

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !scale) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw grid
    drawGrid(ctx, scale);

    // Draw volume
    drawVolume(ctx, processedData, scale);

    // Draw main chart
    switch (config.type) {
      case 'candlestick':
      case 'heikinashi':
        processedData.forEach(candle => drawCandle(ctx, candle, scale));
        break;
      case 'line':
        drawLine(ctx, processedData, scale);
        break;
    }

    // Draw indicators
    config.indicators.forEach(indicator => {
      if (indicator.enabled) {
        drawIndicator(ctx, indicator, processedData, scale);
      }
    });

    // Draw drawings
    drawDrawings(ctx, scale);

    // Draw crosshair
    drawCrosshair(ctx, scale);
  }, [
    dimensions,
    scale,
    processedData,
    config,
    drawGrid,
    drawVolume,
    drawCandle,
    drawLine,
    drawIndicator,
    drawDrawings,
    drawCrosshair,
  ]);

  // Render on data/config changes
  useEffect(() => {
    render();
  }, [render]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedTool || !scale || !mousePos) return;

    const time = scale.invertTimeScale(mousePos.x);
    const price = scale.invertPriceScale(mousePos.y);
    const point: ChartPoint = { x: time, y: price };

    switch (selectedTool) {
      case 'trend':
        if (currentDrawing.length === 0) {
          setCurrentDrawing([point]);
        } else {
          const newDrawing: ChartDrawing = {
            id: `drawing-${Date.now()}`,
            type: selectedTool,
            points: [...currentDrawing, point],
          };
          setConfig(prev => ({
            ...prev,
            drawings: [...prev.drawings, newDrawing],
          }));
          setCurrentDrawing([]);
          setSelectedTool(null);
        }
        break;
        
      case 'horizontal':
        const hLine: ChartDrawing = {
          id: `drawing-${Date.now()}`,
          type: selectedTool,
          points: [point],
        };
        setConfig(prev => ({
          ...prev,
          drawings: [...prev.drawings, hLine],
        }));
        setSelectedTool(null);
        break;
        
      case 'fib':
        if (currentDrawing.length === 0) {
          setCurrentDrawing([point]);
        } else {
          const fibDrawing: ChartDrawing = {
            id: `drawing-${Date.now()}`,
            type: selectedTool,
            points: [...currentDrawing, point],
            levels: [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1],
          };
          setConfig(prev => ({
            ...prev,
            drawings: [...prev.drawings, fibDrawing],
          }));
          setCurrentDrawing([]);
          setSelectedTool(null);
        }
        break;
    }
  }, [selectedTool, scale, mousePos, currentDrawing]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  // Toolbar handlers
  const toggleIndicator = useCallback((type: IndicatorType) => {
    setConfig(prev => {
      const newIndicators = new Map(prev.indicators);
      const existing = newIndicators.get(type);
      
      if (existing) {
        newIndicators.set(type, { ...existing, enabled: !existing.enabled });
      } else {
        const defaultConfigs: Record<IndicatorType, Partial<IndicatorConfig>> = {
          MA: { period: 20, color: '#3b82f6' },
          EMA: { period: 20, color: '#10b981' },
          SMA: { period: 20, color: '#8b5cf6' },
          WMA: { period: 20, color: '#f59e0b' },
          RSI: { period: 14, overbought: 70, oversold: 30 },
          MACD: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
          BB: { period: 20, standardDeviations: 2 },
          VOLUME: {},
          STOCH: { period: 14 },
          ATR: { period: 14 },
        };
        
        newIndicators.set(type, {
          type,
          enabled: true,
          ...defaultConfigs[type],
        } as IndicatorConfig);
      }
      
      return { ...prev, indicators: newIndicators };
    });
  }, []);

  const changeTimeframe = useCallback(async (timeframe: TimeFrame) => {
    setConfig(prev => ({ ...prev, timeframe }));
    
    // Request new data if callback provided
    if (onDataRequest) {
      const now = Date.now();
      const duration = TimeFrameConverter.getMilliseconds(timeframe) * 500; // Load 500 candles
      const newData = await onDataRequest(timeframe, now - duration, now);
      setData(newData);
    }
  }, [onDataRequest]);

  const clearDrawings = useCallback(() => {
    setConfig(prev => ({ ...prev, drawings: [] }));
    setCurrentDrawing([]);
    setSelectedTool(null);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative bg-white dark:bg-gray-900 rounded-lg", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <select
            value={config.timeframe}
            onChange={(e) => changeTimeframe(e.target.value as TimeFrame)}
            className="px-3 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="1m">1분</option>
            <option value="5m">5분</option>
            <option value="15m">15분</option>
            <option value="30m">30분</option>
            <option value="1h">1시간</option>
            <option value="4h">4시간</option>
            <option value="1d">1일</option>
            <option value="1w">1주</option>
            <option value="1M">1개월</option>
          </select>

          {/* Chart type selector */}
          <select
            value={config.type}
            onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as ChartType }))}
            className="px-3 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="candlestick">캔들스틱</option>
            <option value="heikinashi">하이킨아시</option>
            <option value="line">라인</option>
            <option value="bar">바</option>
            <option value="area">영역</option>
          </select>

          {/* Indicator toggles */}
          <div className="flex items-center gap-1">
            {(['MA', 'EMA', 'BB', 'RSI', 'MACD'] as IndicatorType[]).map(type => (
              <button
                key={type}
                onClick={() => toggleIndicator(type)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  config.indicators.get(type)?.enabled
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Drawing tools */}
          <div className="flex items-center gap-1">
            {[
              { tool: 'trend' as DrawingTool, label: '추세선' },
              { tool: 'horizontal' as DrawingTool, label: '수평선' },
              { tool: 'fib' as DrawingTool, label: '피보나치' },
            ].map(({ tool, label }) => (
              <button
                key={tool}
                onClick={() => setSelectedTool(tool)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  selectedTool === tool
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                {label}
              </button>
            ))}
            
            <button
              onClick={clearDrawings}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              지우기
            </button>
          </div>

          {/* View options */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfig(prev => ({ ...prev, showGrid: !prev.showGrid }))}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                config.showGrid
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            >
              그리드
            </button>
            
            <button
              onClick={() => setConfig(prev => ({ ...prev, showVolume: !prev.showVolume }))}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                config.showVolume
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            >
              거래량
            </button>
            
            <button
              onClick={() => setConfig(prev => ({ ...prev, logScale: !prev.logScale }))}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                config.logScale
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            >
              로그
            </button>
          </div>
        </div>
      </div>

      {/* Chart canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Symbol and price info */}
      {processedData.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded">
          <div className="text-lg font-bold">{symbol}</div>
          <div className="text-2xl font-bold">
            {processedData[processedData.length - 1].close.toLocaleString()}
          </div>
          <div className={cn(
            "text-sm",
            processedData[processedData.length - 1].close >= processedData[processedData.length - 1].open
              ? "text-green-500"
              : "text-red-500"
          )}>
            {((processedData[processedData.length - 1].close - processedData[processedData.length - 1].open) / 
              processedData[processedData.length - 1].open * 100).toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}
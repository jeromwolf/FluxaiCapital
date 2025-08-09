'use client';

import React from 'react';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { useChartData } from '@/hooks/useChartData';
import { TimeFrame } from '@/lib/charting/trading-view-chart';
import { MarketCandle } from '@/lib/market/types';

export default function ChartDemoPage() {
  const [symbol, setSymbol] = React.useState('BTCUSDT');
  const [timeframe, setTimeframe] = React.useState<TimeFrame>('1h');

  // Use the chart data hook
  const { candles, loading, error, refresh } = useChartData({
    symbol,
    timeframe,
    limit: 500,
    indicators: ['MA20', 'EMA12', 'RSI', 'MACD', 'BB'],
  });

  // Handle data requests for different timeframes
  const handleDataRequest = async (
    newTimeframe: TimeFrame,
    from: number,
    to: number,
  ): Promise<MarketCandle[]> => {
    // This would normally fetch from your API
    // For now, we'll generate mock data
    const count = Math.floor((to - from) / getTimeframeMs(newTimeframe));
    return generateMockCandles(symbol, newTimeframe, count, from);
  };

  const getTimeframeMs = (tf: TimeFrame): number => {
    const map: Record<TimeFrame, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000,
    };
    return map[tf];
  };

  const generateMockCandles = (
    symbol: string,
    timeframe: TimeFrame,
    count: number,
    startTime: number,
  ): MarketCandle[] => {
    const candles: MarketCandle[] = [];
    const intervalMs = getTimeframeMs(timeframe);

    let basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 3000 : 100;

    for (let i = 0; i < count; i++) {
      const timestamp = startTime + i * intervalMs;
      const volatility = 0.002;

      const open = basePrice;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const high = open * (1 + Math.abs(change) + Math.random() * volatility);
      const low = open * (1 - Math.abs(change) - Math.random() * volatility);
      const close = open * (1 + change);
      const volume = Math.random() * 1000000;

      candles.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume,
      });

      basePrice = close;
    }

    return candles;
  };

  const symbols = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'BNBUSDT', label: 'BNB/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
    { value: 'ADAUSDT', label: 'ADA/USDT' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">차트 데이터 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">에러: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">고급 차트 시스템 데모</h1>
            <div className="flex items-center gap-4">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                {symbols.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button
                onClick={refresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
          <TradingViewChart
            data={candles}
            symbol={symbol}
            height={700}
            onDataRequest={handleDataRequest}
          />
        </div>

        {/* Features Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">차트 타입</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 캔들스틱 차트</li>
              <li>• 하이킨아시 차트</li>
              <li>• 라인 차트</li>
              <li>• 바 차트</li>
              <li>• 영역 차트</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">기술적 지표</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• MA (이동평균선)</li>
              <li>• EMA (지수이동평균)</li>
              <li>• RSI (상대강도지수)</li>
              <li>• MACD</li>
              <li>• 볼린저 밴드</li>
              <li>• 스토캐스틱</li>
              <li>• ATR</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">그리기 도구</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 추세선</li>
              <li>• 수평선/수직선</li>
              <li>• 피보나치 되돌림</li>
              <li>• 사각형</li>
              <li>• 텍스트 주석</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">시간 프레임</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 1분, 5분, 15분, 30분</li>
              <li>• 1시간, 4시간</li>
              <li>• 1일, 1주, 1개월</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">인터랙티브 기능</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 실시간 가격 업데이트</li>
              <li>• 줌 & 팬</li>
              <li>• 크로스헤어 & 툴팁</li>
              <li>• 차트 패턴 인식</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">성능 최적화</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Canvas 기반 렌더링</li>
              <li>• 효율적인 데이터 처리</li>
              <li>• 스무스한 애니메이션</li>
              <li>• 메모리 최적화</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

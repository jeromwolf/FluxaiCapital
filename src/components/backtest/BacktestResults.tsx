'use client';

import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Calendar } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BacktestResultsProps {
  result: any; // TODO: BacktestResult 타입 사용
}

export default function BacktestResults({ result }: BacktestResultsProps) {
  // 임시 데이터 - 실제 결과로 대체될 예정
  const mockResult = {
    performance: {
      totalReturn: 23.45,
      annualizedReturn: 18.32,
      volatility: 12.8,
      sharpeRatio: 1.43,
      sortinoRatio: 1.89,
      maxDrawdown: -8.2,
      maxDrawdownDuration: 45,
      winRate: 68.5,
      profitFactor: 2.1,
      totalTrades: 47,
      winningTrades: 32,
      losingTrades: 15,
      averageWin: 4.2,
      averageLoss: -2.0,
      bestTrade: 12.5,
      worstTrade: -6.8,
      calmarRatio: 2.23,
    },
    config: {
      strategyId: 'moving-average',
      initialCapital: 100000000,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    },
  };

  const data = result || mockResult;

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">백테스트 결과가 없습니다</h3>
          <p className="text-muted-foreground">
            설정 탭에서 백테스트를 실행하세요
          </p>
        </div>
      </div>
    );
  }

  const { performance } = data;

  return (
    <div className="space-y-6">
      {/* 핵심 성과 지표 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수익률</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{performance.totalReturn.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              연환산 수익률 {performance.annualizedReturn.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">샤프 비율</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              소티노 비율 {performance.sortinoRatio.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최대 손실폭</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {performance.maxDrawdown.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {performance.maxDrawdownDuration}일간 지속
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승률</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.winRate.toFixed(1)}%</div>
            <Progress value={performance.winRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 상세 성과 분석 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>위험 지표</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">변동성</span>
              <span className="text-sm">{performance.volatility.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">샤프 비율</span>
              <span className="text-sm">{performance.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">소티노 비율</span>
              <span className="text-sm">{performance.sortinoRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">칼마 비율</span>
              <span className="text-sm">{performance.calmarRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">최대 손실폭</span>
              <span className="text-sm text-red-600">{performance.maxDrawdown.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>거래 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">총 거래 횟수</span>
              <span className="text-sm">{performance.totalTrades}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">승리 거래</span>
              <span className="text-sm text-green-600">{performance.winningTrades}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">패배 거래</span>
              <span className="text-sm text-red-600">{performance.losingTrades}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">평균 수익</span>
              <span className="text-sm text-green-600">+{performance.averageWin.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">평균 손실</span>
              <span className="text-sm text-red-600">{performance.averageLoss.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">손익 비율</span>
              <span className="text-sm">{performance.profitFactor.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>자본 곡선</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              수익률 차트 영역
              <br />
              (향후 차트 라이브러리로 구현)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>드로우다운</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              드로우다운 차트 영역
              <br />
              (향후 차트 라이브러리로 구현)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
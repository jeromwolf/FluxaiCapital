'use client';

import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Calendar, Target } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BacktestAnalysisProps {
  result: any; // TODO: BacktestResult 타입 사용
}

export default function BacktestAnalysis({ result }: BacktestAnalysisProps) {
  // 임시 분석 데이터
  const mockAnalysis = {
    riskMetrics: {
      valueAtRisk: {
        var95: -2.5,
        var99: -4.2,
        expectedShortfall95: -3.1,
        expectedShortfall99: -5.8,
      },
      riskAdjustedReturns: {
        treynorRatio: 1.43,
        jensenAlpha: 2.1,
        informationRatio: 1.15,
      },
      drawdownAnalysis: {
        maxDrawdown: -8.2,
        maxDrawdownDuration: 45,
        avgDrawdown: -2.8,
        recoveryTime: 12,
        drawdownFrequency: 15.3,
      },
    },
    tradeAnalysis: {
      profitDistribution: {
        profits: [2.1, 3.5, 1.8, 4.2, 2.7, 1.9, 3.1],
        losses: [-1.5, -2.3, -1.1, -0.8, -1.9, -2.1],
        breakeven: 3,
      },
      consecutiveAnalysis: {
        maxConsecutiveWins: 5,
        maxConsecutiveLosses: 3,
        avgConsecutiveWins: 2.3,
        avgConsecutiveLosses: 1.8,
      },
      tradeTiming: {
        monthlyWinRate: {
          '2023-01': 75,
          '2023-02': 60,
          '2023-03': 80,
          '2023-04': 55,
          '2023-05': 70,
          '2023-06': 65,
        },
        bestTradingMonth: '2023-03',
        worstTradingMonth: '2023-04',
      },
    },
    periodAnalysis: [
      {
        period: 'Q1 2023',
        return: 8.5,
        volatility: 10.2,
        maxDrawdown: -3.1,
        trades: 12,
        winRate: 66.7,
      },
      {
        period: 'Q2 2023',
        return: 6.3,
        volatility: 12.5,
        maxDrawdown: -5.2,
        trades: 15,
        winRate: 60.0,
      },
      {
        period: 'Q3 2023',
        return: 4.8,
        volatility: 9.8,
        maxDrawdown: -2.8,
        trades: 11,
        winRate: 72.7,
      },
      {
        period: 'Q4 2023',
        return: 3.9,
        volatility: 11.3,
        maxDrawdown: -8.2,
        trades: 9,
        winRate: 77.8,
      },
    ],
    recommendations: [
      '샤프 비율이 우수합니다. 현재 전략을 유지하거나 포지션 크기를 늘려보세요.',
      '최대 손실폭이 8.2%로 양호한 수준입니다.',
      'Q3에 가장 안정적인 성과를 보였습니다. 해당 기간의 시장 조건을 분석해보세요.',
      '연속 승리 횟수가 높아 모멘텀 활용이 효과적입니다.',
    ],
  };

  const analysis = mockAnalysis;

  return (
    <div className="space-y-6">
      {/* 추천 사항 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            전략 분석 및 추천
          </CardTitle>
          <CardDescription>백테스트 결과를 바탕으로 한 개선 방안</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <Alert key={index}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{recommendation}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk">리스크 분석</TabsTrigger>
          <TabsTrigger value="trades">거래 패턴</TabsTrigger>
          <TabsTrigger value="periods">기간별 분석</TabsTrigger>
          <TabsTrigger value="distribution">수익 분포</TabsTrigger>
        </TabsList>

        {/* 리스크 분석 */}
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Value at Risk (VaR)</CardTitle>
                <CardDescription>일일 손실 위험 추정치</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">95% VaR</span>
                    <span className="text-sm font-medium text-red-600">
                      {analysis.riskMetrics.valueAtRisk.var95.toFixed(2)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(analysis.riskMetrics.valueAtRisk.var95) * 10}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">99% VaR</span>
                    <span className="text-sm font-medium text-red-600">
                      {analysis.riskMetrics.valueAtRisk.var99.toFixed(2)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(analysis.riskMetrics.valueAtRisk.var99) * 10}
                    className="h-2"
                  />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Expected Shortfall (95%)</span>
                    <span className="text-red-600">
                      {analysis.riskMetrics.valueAtRisk.expectedShortfall95.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>드로우다운 분석</CardTitle>
                <CardDescription>최대 손실 기간 및 회복 시간</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">최대 드로우다운</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysis.riskMetrics.drawdownAnalysis.maxDrawdown.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">지속 기간</span>
                  <span className="text-sm font-medium">
                    {analysis.riskMetrics.drawdownAnalysis.maxDrawdownDuration}일
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">평균 드로우다운</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysis.riskMetrics.drawdownAnalysis.avgDrawdown.toFixed(2)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">평균 회복 시간</span>
                  <span className="text-sm font-medium">
                    {analysis.riskMetrics.drawdownAnalysis.recoveryTime}일
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm">드로우다운 빈도</span>
                  <span className="text-sm font-medium">
                    {analysis.riskMetrics.drawdownAnalysis.drawdownFrequency.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>위험 조정 수익률</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {analysis.riskMetrics.riskAdjustedReturns.treynorRatio.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">트레이너 비율</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.riskMetrics.riskAdjustedReturns.jensenAlpha.toFixed(2)}%
                  </div>
                  <div className="text-sm text-muted-foreground">젠센 알파</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {analysis.riskMetrics.riskAdjustedReturns.informationRatio.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">정보 비율</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 거래 패턴 분석 */}
        <TabsContent value="trades" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>연속 거래 분석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">최대 연속 승리</span>
                  <span className="text-sm font-medium text-green-600">
                    {analysis.tradeAnalysis.consecutiveAnalysis.maxConsecutiveWins}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">최대 연속 손실</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysis.tradeAnalysis.consecutiveAnalysis.maxConsecutiveLosses}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">평균 연속 승리</span>
                  <span className="text-sm font-medium">
                    {analysis.tradeAnalysis.consecutiveAnalysis.avgConsecutiveWins.toFixed(1)}회
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">평균 연속 손실</span>
                  <span className="text-sm font-medium">
                    {analysis.tradeAnalysis.consecutiveAnalysis.avgConsecutiveLosses.toFixed(1)}회
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>월별 성과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">최고 성과 월</span>
                  <span className="text-sm font-medium text-green-600">
                    {analysis.tradeAnalysis.tradeTiming.bestTradingMonth}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">최저 성과 월</span>
                  <span className="text-sm font-medium text-red-600">
                    {analysis.tradeAnalysis.tradeTiming.worstTradingMonth}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">월별 승률</div>
                  {Object.entries(analysis.tradeAnalysis.tradeTiming.monthlyWinRate).map(
                    ([month, rate]) => (
                      <div key={month} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{month}</span>
                          <span>{rate.toFixed(1)}%</span>
                        </div>
                        <Progress value={rate} className="h-1" />
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 기간별 분석 */}
        <TabsContent value="periods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>분기별 성과 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.periodAnalysis.map((period, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{period.period}</h4>
                      <span
                        className={`text-sm font-medium ${
                          period.return >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {period.return >= 0 ? '+' : ''}
                        {period.return.toFixed(2)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">변동성</div>
                        <div className="font-medium">{period.volatility.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">최대 손실</div>
                        <div className="font-medium text-red-600">
                          {period.maxDrawdown.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">거래 수</div>
                        <div className="font-medium">{period.trades}회</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">승률</div>
                        <div className="font-medium">{period.winRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 수익 분포 */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>수익 거래 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    수익 거래: {analysis.tradeAnalysis.profitDistribution.profits.length}회
                  </div>
                  <div className="text-sm">
                    평균 수익: +
                    {(
                      analysis.tradeAnalysis.profitDistribution.profits.reduce(
                        (sum, profit) => sum + profit,
                        0,
                      ) / analysis.tradeAnalysis.profitDistribution.profits.length
                    ).toFixed(2)}
                    %
                  </div>
                  <div className="text-sm">
                    최대 수익: +
                    {Math.max(...analysis.tradeAnalysis.profitDistribution.profits).toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>손실 거래 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    손실 거래: {analysis.tradeAnalysis.profitDistribution.losses.length}회
                  </div>
                  <div className="text-sm">
                    평균 손실:{' '}
                    {(
                      analysis.tradeAnalysis.profitDistribution.losses.reduce(
                        (sum, loss) => sum + loss,
                        0,
                      ) / analysis.tradeAnalysis.profitDistribution.losses.length
                    ).toFixed(2)}
                    %
                  </div>
                  <div className="text-sm">
                    최대 손실:{' '}
                    {Math.min(...analysis.tradeAnalysis.profitDistribution.losses).toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

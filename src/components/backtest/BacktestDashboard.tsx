'use client';

import { useState } from 'react';
import { Play, Settings, BarChart3, TrendingUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BacktestConfig from './BacktestConfig';
import BacktestResults from './BacktestResults';
import BacktestHistory from './BacktestHistory';

interface BacktestDashboardProps {
  userId: string;
}

export default function BacktestDashboard({ userId }: BacktestDashboardProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const stats = {
    totalBacktests: 12,
    bestStrategy: 'Moving Average',
    bestReturn: 23.4,
    avgReturn: 12.8,
  };

  return (
    <>
      {/* 요약 통계 */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 백테스트</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBacktests}개</div>
            <p className="text-xs text-muted-foreground">실행한 백테스트 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최고 전략</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bestStrategy}</div>
            <p className="text-xs text-muted-foreground">+{stats.bestReturn}% 수익률</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 수익률</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.avgReturn}%</div>
            <p className="text-xs text-muted-foreground">모든 전략 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">백테스트 상태</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isRunning ? '실행 중' : '대기'}</div>
            <p className="text-xs text-muted-foreground">
              {isRunning ? '백테스트 진행 중...' : '설정 후 실행'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="config">설정</TabsTrigger>
            <TabsTrigger value="results">결과</TabsTrigger>
            <TabsTrigger value="history">히스토리</TabsTrigger>
          </TabsList>

          {activeTab === 'config' && (
            <Button
              onClick={() => {
                setIsRunning(true);
                // TODO: 백테스트 실행 로직
                setTimeout(() => {
                  setIsRunning(false);
                  setActiveTab('results');
                }, 3000);
              }}
              disabled={isRunning}
            >
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? '실행 중...' : '백테스트 실행'}
            </Button>
          )}
        </div>

        <TabsContent value="config" className="space-y-4">
          <BacktestConfig userId={userId} isRunning={isRunning} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <BacktestResults result={currentResult} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <BacktestHistory userId={userId} />
        </TabsContent>
      </Tabs>
    </>
  );
}

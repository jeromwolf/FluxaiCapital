'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Calendar } from 'lucide-react';

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  // 임시 데이터 - 추후 실제 API 연동
  const stats = {
    totalValue: 100000000,
    totalReturn: 12.5,
    monthlyReturn: 2.3,
    dailyChange: -0.5,
  };

  return (
    <div className="space-y-8">
      {/* 주요 지표 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산가치</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">초기 자금 대비 +{stats.totalReturn}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일간 수익률</CardTitle>
            {stats.dailyChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.dailyChange >= 0 ? '+' : ''}
              {stats.dailyChange}%
            </div>
            <p className="text-xs text-muted-foreground">전일 대비</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월간 수익률</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.monthlyReturn}%</div>
            <p className="text-xs text-muted-foreground">최근 30일</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 수익률</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.totalReturn}%</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>
      </div>

      {/* 포트폴리오 및 차트 섹션 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>포트폴리오 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              차트 영역 (추후 구현)
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>자산 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              <PieChart className="h-32 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 거래</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">거래 내역이 없습니다</div>
        </CardContent>
      </Card>
    </div>
  );
}

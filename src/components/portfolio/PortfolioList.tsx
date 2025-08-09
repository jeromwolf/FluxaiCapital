'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreatePortfolioDialog from './CreatePortfolioDialog';

interface PortfolioListProps {
  userId: string;
}

export default function PortfolioList({ userId }: PortfolioListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 임시 데이터 - 추후 실제 API 연동
  const portfolios = [
    {
      id: '1',
      name: '성장주 포트폴리오',
      description: '고성장 기술주 중심 포트폴리오',
      totalValue: 50000000,
      dailyReturn: 2.3,
      totalReturn: 15.2,
      holdings: 5,
    },
    {
      id: '2',
      name: '안정형 포트폴리오',
      description: '배당주와 채권 중심의 안정적인 포트폴리오',
      totalValue: 30000000,
      dailyReturn: -0.5,
      totalReturn: 8.7,
      holdings: 8,
    },
    {
      id: '3',
      name: '암호화폐 포트폴리오',
      description: '주요 암호화폐 투자 포트폴리오',
      totalValue: 20000000,
      dailyReturn: -3.2,
      totalReturn: 45.3,
      holdings: 4,
    },
  ];

  const totalValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);

  return (
    <>
      {/* 요약 정보 */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 포트폴리오 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolios.length}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">총 자산가치</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 수익률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +
              {(portfolios.reduce((sum, p) => sum + p.totalReturn, 0) / portfolios.length).toFixed(
                1,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 포트폴리오 목록 */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />새 포트폴리오
          </Button>
        </div>

        {portfolios.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="mb-4 text-muted-foreground">아직 생성된 포트폴리오가 없습니다</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />첫 포트폴리오 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                href={`/portfolio/${portfolio.id}`}
                className="transition-transform hover:scale-[1.02]"
              >
                <Card className="h-full cursor-pointer">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{portfolio.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: 포트폴리오 옵션 메뉴
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">총 가치</span>
                        <span className="font-semibold">
                          ₩{portfolio.totalValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">일간 수익률</span>
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            portfolio.dailyReturn >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {portfolio.dailyReturn >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {portfolio.dailyReturn >= 0 ? '+' : ''}
                          {portfolio.dailyReturn}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">누적 수익률</span>
                        <span
                          className={`font-semibold ${
                            portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {portfolio.totalReturn >= 0 ? '+' : ''}
                          {portfolio.totalReturn}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">보유 종목</span>
                        <span className="font-semibold">{portfolio.holdings}개</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreatePortfolioDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        userId={userId}
      />
    </>
  );
}

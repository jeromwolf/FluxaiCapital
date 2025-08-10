'use client';

import { Clock, TrendingUp, TrendingDown, Eye, Trash2, Download } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BacktestHistoryProps {
  userId: string;
}

export default function BacktestHistory({ userId }: BacktestHistoryProps) {
  // 임시 데이터 - 실제 API로 대체될 예정
  const [backtests] = useState([
    {
      id: '1',
      name: 'Moving Average Strategy',
      strategy: '이동평균선 교차',
      period: '2023-01-01 ~ 2023-12-31',
      initialCapital: 100000000,
      totalReturn: 23.45,
      sharpeRatio: 1.43,
      maxDrawdown: -8.2,
      totalTrades: 47,
      createdAt: '2024-01-15 14:30',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Buy and Hold KOSPI',
      strategy: 'Buy & Hold',
      period: '2023-01-01 ~ 2023-12-31',
      initialCapital: 100000000,
      totalReturn: 18.32,
      sharpeRatio: 0.98,
      maxDrawdown: -12.5,
      totalTrades: 1,
      createdAt: '2024-01-14 09:15',
      status: 'completed',
    },
    {
      id: '3',
      name: 'Rebalancing Strategy',
      strategy: '리밸런싱',
      period: '2023-01-01 ~ 2023-12-31',
      initialCapital: 100000000,
      totalReturn: 15.67,
      sharpeRatio: 1.12,
      maxDrawdown: -6.8,
      totalTrades: 24,
      createdAt: '2024-01-13 16:45',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Test Strategy',
      strategy: '이동평균선 교차',
      period: '2023-06-01 ~ 2023-12-31',
      initialCapital: 50000000,
      totalReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      totalTrades: 0,
      createdAt: '2024-01-13 11:20',
      status: 'failed',
    },
  ]);

  const handleView = (id: string) => {
    console.log('View backtest:', id);
    // TODO: 결과 상세 보기 구현
  };

  const handleDelete = (id: string) => {
    console.log('Delete backtest:', id);
    // TODO: 백테스트 삭제 구현
  };

  const handleExport = (id: string) => {
    console.log('Export backtest:', id);
    // TODO: 결과 내보내기 구현
  };

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 백테스트</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backtests.length}개</div>
            <p className="text-xs text-muted-foreground">
              성공 {backtests.filter((b) => b.status === 'completed').length}개
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최고 수익률</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +
              {Math.max(
                ...backtests.filter((b) => b.status === 'completed').map((b) => b.totalReturn),
              ).toFixed(2)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Moving Average Strategy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 샤프 비율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                backtests
                  .filter((b) => b.status === 'completed')
                  .reduce((sum, b) => sum + b.sharpeRatio, 0) /
                backtests.filter((b) => b.status === 'completed').length
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">리스크 대비 수익</p>
          </CardContent>
        </Card>
      </div>

      {/* 백테스트 히스토리 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>백테스트 히스토리</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>전략</TableHead>
                <TableHead>기간</TableHead>
                <TableHead>수익률</TableHead>
                <TableHead>샤프 비율</TableHead>
                <TableHead>최대 손실</TableHead>
                <TableHead>거래 횟수</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backtests.map((backtest) => (
                <TableRow key={backtest.id}>
                  <TableCell className="font-medium">{backtest.name}</TableCell>
                  <TableCell>{backtest.strategy}</TableCell>
                  <TableCell className="text-sm">{backtest.period}</TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center gap-1 ${
                        backtest.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {backtest.totalReturn >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {backtest.status === 'completed'
                        ? `${backtest.totalReturn >= 0 ? '+' : ''}${backtest.totalReturn.toFixed(2)}%`
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {backtest.status === 'completed' ? backtest.sharpeRatio.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="text-red-600">
                      {backtest.status === 'completed'
                        ? `${backtest.maxDrawdown.toFixed(2)}%`
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {backtest.status === 'completed' ? `${backtest.totalTrades}회` : '-'}
                  </TableCell>
                  <TableCell className="text-sm">{backtest.createdAt}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        backtest.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : backtest.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {backtest.status === 'completed'
                        ? '완료'
                        : backtest.status === 'failed'
                          ? '실패'
                          : '실행중'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleView(backtest.id)}
                        disabled={backtest.status !== 'completed'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleExport(backtest.id)}
                        disabled={backtest.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(backtest.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Download, TrendingUp, TrendingDown, Activity, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BacktestResult {
  config: {
    strategyId: string;
    symbols: string[];
    startDate: string;
    endDate: string;
    initialCapital: number;
    commission: number;
    slippage: number;
  };
  metrics: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
  };
  trades: Array<{
    date: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    commission: number;
    slippage: number;
    totalCost: number;
  }>;
  equityCurve: Array<{
    date: string;
    value: number;
    drawdown: number;
  }>;
  dailyReturns: Array<{
    date: string;
    return: number;
  }>;
}

export default function BacktestPage() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [result, setResult] = React.useState<BacktestResult | null>(null);
  const [strategies, setStrategies] = React.useState<Array<{ id: string; name: string; description: string }>>([]);
  
  const [config, setConfig] = React.useState({
    strategyId: 'momentum-20',
    symbols: 'NVDA,AAPL,MSFT',
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: '10000000',
    commission: '0.1',
    slippage: '0.05',
  });

  React.useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/v1/backtest');
      const data = await response.json();
      if (data.success) {
        setStrategies(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  };

  const runBacktest = async () => {
    setIsRunning(true);
    
    try {
      const response = await fetch('/api/v1/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          symbols: config.symbols.split(',').map(s => s.trim()),
          initialCapital: parseFloat(config.initialCapital),
          commission: parseFloat(config.commission),
          slippage: parseFloat(config.slippage),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        toast.success('백테스트가 완료되었습니다');
      } else {
        toast.error(data.message || '백테스트 실행 실패');
      }
    } catch (error) {
      console.error('Backtest error:', error);
      toast.error('백테스트 실행 중 오류가 발생했습니다');
    } finally {
      setIsRunning(false);
    }
  };

  const formatEquityData = (data: BacktestResult['equityCurve']) => {
    return data.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MM/dd'),
      value: Math.round(item.value),
      drawdown: Math.round(item.drawdown * 100 * 100) / 100,
    }));
  };

  const formatReturnsData = (data: BacktestResult['dailyReturns']) => {
    return data.map(item => ({
      date: format(new Date(item.date), 'MM/dd'),
      return: Math.round(item.return * 10000) / 100,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          백테스팅
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          과거 데이터로 투자 전략을 시뮬레이션하고 성과를 분석합니다
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>백테스트 설정</CardTitle>
              <CardDescription>전략과 파라미터를 설정하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strategy">전략 선택</Label>
                <Select
                  value={config.strategyId}
                  onValueChange={(value) => setConfig({ ...config, strategyId: value })}
                >
                  <SelectTrigger id="strategy">
                    <SelectValue placeholder="전략을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map(strategy => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symbols">종목 코드 (쉼표로 구분)</Label>
                <Input
                  id="symbols"
                  value={config.symbols}
                  onChange={(e) => setConfig({ ...config, symbols: e.target.value })}
                  placeholder="NVDA,AAPL,MSFT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={config.endDate}
                    onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capital">초기 자본금</Label>
                <Input
                  id="capital"
                  type="number"
                  value={config.initialCapital}
                  onChange={(e) => setConfig({ ...config, initialCapital: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">수수료 (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={config.commission}
                    onChange={(e) => setConfig({ ...config, commission: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slippage">슬리피지 (%)</Label>
                  <Input
                    id="slippage"
                    type="number"
                    step="0.01"
                    value={config.slippage}
                    onChange={(e) => setConfig({ ...config, slippage: e.target.value })}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={runBacktest}
                disabled={isRunning}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    백테스트 실행
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6">
              {/* Metrics Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <ResponsiveCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">총 수익률</p>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className={cn(
                    "text-2xl font-bold mt-2",
                    result.metrics.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {result.metrics.totalReturn >= 0 ? '+' : ''}{result.metrics.totalReturn.toFixed(2)}%
                  </p>
                </ResponsiveCard>

                <ResponsiveCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">연환산 수익률</p>
                    <Activity className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className={cn(
                    "text-2xl font-bold mt-2",
                    result.metrics.annualizedReturn >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {result.metrics.annualizedReturn >= 0 ? '+' : ''}{result.metrics.annualizedReturn.toFixed(2)}%
                  </p>
                </ResponsiveCard>

                <ResponsiveCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">샤프 비율</p>
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {result.metrics.sharpeRatio.toFixed(2)}
                  </p>
                </ResponsiveCard>

                <ResponsiveCard className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">최대 낙폭</p>
                    <TrendingDown className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-red-600">
                    -{result.metrics.maxDrawdown.toFixed(2)}%
                  </p>
                </ResponsiveCard>
              </div>

              {/* Charts */}
              <Tabs defaultValue="equity" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="equity">자산 가치</TabsTrigger>
                  <TabsTrigger value="returns">일별 수익률</TabsTrigger>
                  <TabsTrigger value="trades">거래 내역</TabsTrigger>
                </TabsList>

                <TabsContent value="equity">
                  <ResponsiveCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">자산 가치 추이</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formatEquityData(result.equityCurve)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </ResponsiveCard>
                </TabsContent>

                <TabsContent value="returns">
                  <ResponsiveCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">일별 수익률</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={formatReturnsData(result.dailyReturns)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="return"
                            fill={(entry: any) => entry.return >= 0 ? '#10b981' : '#ef4444'}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ResponsiveCard>
                </TabsContent>

                <TabsContent value="trades">
                  <ResponsiveCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">거래 내역 ({result.trades.length}건)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">날짜</th>
                            <th className="text-left p-2">종목</th>
                            <th className="text-left p-2">유형</th>
                            <th className="text-right p-2">수량</th>
                            <th className="text-right p-2">가격</th>
                            <th className="text-right p-2">수수료</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.slice(0, 20).map((trade, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2">{format(new Date(trade.date), 'yyyy-MM-dd')}</td>
                              <td className="p-2">{trade.symbol}</td>
                              <td className="p-2">
                                <span className={cn(
                                  "px-2 py-1 text-xs rounded",
                                  trade.type === 'BUY' 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                                )}>
                                  {trade.type}
                                </span>
                              </td>
                              <td className="text-right p-2">{trade.quantity}</td>
                              <td className="text-right p-2">{trade.price.toFixed(2)}</td>
                              <td className="text-right p-2">{trade.commission.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.trades.length > 20 && (
                        <p className="text-center text-sm text-gray-500 mt-4">
                          ... 그 외 {result.trades.length - 20}건
                        </p>
                      )}
                    </div>
                  </ResponsiveCard>
                </TabsContent>
              </Tabs>

              {/* Additional Metrics */}
              <ResponsiveCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">상세 지표</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">승률</p>
                    <p className="text-lg font-semibold">{result.metrics.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">손익비</p>
                    <p className="text-lg font-semibold">{result.metrics.profitFactor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">총 거래 횟수</p>
                    <p className="text-lg font-semibold">{result.metrics.totalTrades}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">수익 거래</p>
                    <p className="text-lg font-semibold text-green-600">{result.metrics.winningTrades}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">손실 거래</p>
                    <p className="text-lg font-semibold text-red-600">{result.metrics.losingTrades}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">최종 자산</p>
                    <p className="text-lg font-semibold">
                      {result.equityCurve[result.equityCurve.length - 1]?.value.toLocaleString()} KRW
                    </p>
                  </div>
                </div>
              </ResponsiveCard>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  백테스트를 실행하세요
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  전략과 파라미터를 설정한 후 실행 버튼을 클릭하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Calendar, DollarSign, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AVAILABLE_STRATEGIES } from '@/lib/backtest/strategies';

interface BacktestConfigProps {
  userId: string;
  isRunning: boolean;
}

export default function BacktestConfig({ userId, isRunning }: BacktestConfigProps) {
  const [config, setConfig] = useState({
    strategyId: '',
    portfolioId: '',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    initialCapital: 100000000,
    currency: 'KRW',
    benchmark: 'KOSPI',
    rebalancePeriod: 'monthly',
    transactionCost: 0.001,
    slippage: 0.0005,
  });

  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({});

  const selectedStrategy = AVAILABLE_STRATEGIES.find(s => s.id === config.strategyId);

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateStrategyParam = (key: string, value: any) => {
    setStrategyParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 기본 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            기본 설정
          </CardTitle>
          <CardDescription>
            백테스트의 기본 매개변수를 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={config.startDate}
                onChange={(e) => updateConfig('startDate', e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                id="endDate"
                type="date"
                value={config.endDate}
                onChange={(e) => updateConfig('endDate', e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialCapital">초기 자본</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="initialCapital"
                type="number"
                placeholder="100000000"
                value={config.initialCapital}
                onChange={(e) => updateConfig('initialCapital', parseFloat(e.target.value) || 0)}
                className="pl-10"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">기준 통화</Label>
              <Select 
                value={config.currency} 
                onValueChange={(value) => updateConfig('currency', value)}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">한국 원 (KRW)</SelectItem>
                  <SelectItem value="USD">미국 달러 (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benchmark">벤치마크</Label>
              <Select 
                value={config.benchmark} 
                onValueChange={(value) => updateConfig('benchmark', value)}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KOSPI">KOSPI</SelectItem>
                  <SelectItem value="KOSDAQ">KOSDAQ</SelectItem>
                  <SelectItem value="S&P500">S&P 500</SelectItem>
                  <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transactionCost">거래 수수료 (%)</Label>
              <Input
                id="transactionCost"
                type="number"
                step="0.0001"
                value={config.transactionCost}
                onChange={(e) => updateConfig('transactionCost', parseFloat(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slippage">슬리피지 (%)</Label>
              <Input
                id="slippage"
                type="number"
                step="0.0001"
                value={config.slippage}
                onChange={(e) => updateConfig('slippage', parseFloat(e.target.value) || 0)}
                disabled={isRunning}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 전략 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            전략 설정
          </CardTitle>
          <CardDescription>
            백테스트할 투자 전략을 선택하고 설정하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">투자 전략</Label>
            <Select 
              value={config.strategyId} 
              onValueChange={(value) => updateConfig('strategyId', value)}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="전략을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_STRATEGIES.map((strategy) => (
                  <SelectItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStrategy && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedStrategy.description}
                </p>
              </div>

              {/* 전략 매개변수 */}
              {Object.entries(selectedStrategy.parameters).map(([key, param]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{param.description}</Label>
                  {param.type === 'select' ? (
                    <Select
                      value={strategyParams[key] || param.default}
                      onValueChange={(value) => updateStrategyParam(key, value)}
                      disabled={isRunning}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {param.options.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={key}
                      type={param.type}
                      value={strategyParams[key] || param.default}
                      onChange={(e) => {
                        const value = param.type === 'number' 
                          ? parseFloat(e.target.value) || param.default
                          : e.target.value;
                        updateStrategyParam(key, value);
                      }}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      disabled={isRunning}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="symbols">대상 종목 (쉼표로 구분)</Label>
            <Textarea
              id="symbols"
              placeholder="예: AAPL, GOOGL, MSFT, TSLA"
              rows={3}
              disabled={isRunning}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
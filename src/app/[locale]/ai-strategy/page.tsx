'use client';

import React, { useState } from 'react';
import { Brain, TrendingUp, Shield, AlertCircle, ChevronRight } from 'lucide-react';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { aiStrategy, TradingStrategy, UserProfile } from '@/lib/ai/strategy-engine';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const riskLevels = [
  { value: 'conservative', label: '보수적', description: '원금 보존 중시' },
  { value: 'moderate', label: '중도적', description: '균형잡힌 수익과 위험' },
  { value: 'aggressive', label: '공격적', description: '높은 수익 추구' },
];

const investmentHorizons = [
  { value: 'short', label: '단기', description: '1년 미만' },
  { value: 'medium', label: '중기', description: '1-5년' },
  { value: 'long', label: '장기', description: '5년 이상' },
];

export default function AIStrategyPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    riskTolerance: 'moderate',
    investmentHorizon: 'medium',
    age: 35,
    goalReturn: 10,
    currentPortfolioValue: 100000000, // 1억원
    monthlyContribution: 1000000, // 100만원
  });

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await aiStrategy.getRecommendations(userProfile);
      setStrategies(recommendations);

      if (recommendations.length > 0) {
        const firstStrategy = recommendations[0];
        if (firstStrategy) {
          setSelectedStrategy(firstStrategy);
          const insights = await aiStrategy.generateInsights(firstStrategy, userProfile);
          setInsights(insights);
        }
      }

      toast({
        title: 'AI 분석 완료',
        description: `${recommendations.length}개의 전략을 추천했습니다.`,
      });
    } catch (error) {
      toast({
        title: '오류 발생',
        description: 'AI 분석 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '낮음';
      case 'medium':
        return '중간';
      case 'high':
        return '높음';
      default:
        return riskLevel;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">AI 전략 추천</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              AI가 분석한 맞춤형 투자 전략을 추천받으세요
            </p>
          </div>
          <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* User Profile Input */}
        <ResponsiveCard>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            투자 프로필 설정
          </h2>

          <div className="space-y-6">
            {/* Risk Tolerance */}
            <div>
              <Label className="text-base font-medium mb-3 block">위험 성향</Label>
              <RadioGroup
                value={userProfile.riskTolerance}
                onValueChange={(value: any) =>
                  setUserProfile({ ...userProfile, riskTolerance: value })
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {riskLevels.map((level) => (
                    <div key={level.value} className="relative">
                      <RadioGroupItem
                        value={level.value}
                        id={level.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={level.value}
                        className={cn(
                          'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                          'hover:border-blue-200 dark:hover:border-blue-800',
                          'peer-checked:border-blue-600 dark:peer-checked:border-blue-400',
                          'peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20',
                        )}
                      >
                        <span className="font-medium">{level.label}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {level.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Investment Horizon */}
            <div>
              <Label className="text-base font-medium mb-3 block">투자 기간</Label>
              <RadioGroup
                value={userProfile.investmentHorizon}
                onValueChange={(value: any) =>
                  setUserProfile({ ...userProfile, investmentHorizon: value })
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {investmentHorizons.map((horizon) => (
                    <div key={horizon.value} className="relative">
                      <RadioGroupItem
                        value={horizon.value}
                        id={`horizon-${horizon.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`horizon-${horizon.value}`}
                        className={cn(
                          'flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all',
                          'hover:border-blue-200 dark:hover:border-blue-800',
                          'peer-checked:border-blue-600 dark:peer-checked:border-blue-400',
                          'peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20',
                        )}
                      >
                        <span className="font-medium">{horizon.label}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {horizon.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Goal Return */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                목표 수익률 (연간): {userProfile.goalReturn}%
              </Label>
              <Slider
                value={[userProfile.goalReturn]}
                onValueChange={([value]) =>
                  setUserProfile({ ...userProfile, goalReturn: value ?? userProfile.goalReturn })
                }
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span>5%</span>
                <span>15%</span>
                <span>30%</span>
              </div>
            </div>

            <Button onClick={handleGetRecommendations} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI 전략 추천받기
                </>
              )}
            </Button>
          </div>
        </ResponsiveCard>

        {/* Strategy Recommendations */}
        {strategies.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI 추천 전략</h2>

            {strategies.map((strategy, index) => (
              <ResponsiveCard
                key={strategy.id}
                className={cn(
                  'cursor-pointer transition-all',
                  selectedStrategy?.id === strategy.id && 'ring-2 ring-blue-600 dark:ring-blue-400',
                )}
                onClick={async () => {
                  setSelectedStrategy(strategy);
                  const newInsights = await aiStrategy.generateInsights(strategy, userProfile);
                  setInsights(newInsights);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {index + 1}. {strategy.nameKr}
                        </span>
                        {getRiskIcon(strategy.riskLevel)}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                          신뢰도 {strategy.confidence}%
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {strategy.descriptionKr}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          예상 수익률
                        </span>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{strategy.expectedReturn}%
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">변동성</span>
                        <p className="font-semibold">{strategy.volatility}%</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">샤프 비율</span>
                        <p className="font-semibold">{strategy.sharpeRatio}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">위험도</span>
                        <p className="font-semibold">{getRiskLabel(strategy.riskLevel)}</p>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </ResponsiveCard>
            ))}
          </div>
        )}

        {/* Selected Strategy Details */}
        {selectedStrategy && (
          <ResponsiveCard>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {selectedStrategy.nameKr} 상세 정보
            </h3>

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">AI 인사이트</h4>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Holdings */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                추천 포트폴리오 구성
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(selectedStrategy.allocation).map(([symbol, weight]) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">{symbol}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{weight}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Backtest Results */}
            {selectedStrategy.backtestResults && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">백테스트 결과</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">총 수익률</span>
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      +{selectedStrategy.backtestResults.totalReturn}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">최대 낙폭</span>
                    <p className="font-semibold text-red-600 dark:text-red-400">
                      {selectedStrategy.backtestResults.maxDrawdown}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs text-gray-600 dark:text-gray-400">승률</span>
                    <p className="font-semibold">{selectedStrategy.backtestResults.winRate}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button className="w-full">이 전략으로 포트폴리오 구성하기</Button>
            </div>
          </ResponsiveCard>
        )}
      </div>
    </DashboardLayout>
  );
}

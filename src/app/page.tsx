import Link from 'next/link';
import { TrendingUp, Shield, BarChart3, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">FLUX AI Capital</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              AI 기반 전략적 자산관리 플랫폼
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              1억원에서 시작하는 스마트한 투자, 데이터 기반의 전략으로 수익을 극대화하세요
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                <TrendingUp className="mr-2 h-5 w-5" />
                시작하기
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                로그인
              </Button>
            </Link>
            {process.env.NODE_ENV === 'development' && (
              <Link href="/dev-login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  개발자 모드
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">핵심 기능</h2>
            <p className="text-lg text-muted-foreground">
              전문가 수준의 자산관리 도구를 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>포트폴리오 관리</CardTitle>
                <CardDescription>
                  체계적인 자산 배분과 실시간 성과 모니터링
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>백테스팅</CardTitle>
                <CardDescription>
                  다양한 투자 전략의 과거 성과를 분석하고 검증
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>리스크 관리</CardTitle>
                <CardDescription>
                  VaR, 스트레스 테스트 등 고도화된 위험 분석
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI 분석</CardTitle>
                <CardDescription>
                  머신러닝 기반 시장 예측과 투자 인사이트
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">1억원+</div>
              <div className="text-lg text-muted-foreground">초기 운용 자금</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">15%+</div>
              <div className="text-lg text-muted-foreground">목표 연간 수익률</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">AI</div>
              <div className="text-lg text-muted-foreground">기반 투자 전략</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            지금 시작하세요
          </h2>
          <p className="text-lg text-muted-foreground">
            전문가 수준의 자산관리를 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                무료로 시작하기
              </Button>
            </Link>
            <Link href="/backtest">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                백테스트 체험
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

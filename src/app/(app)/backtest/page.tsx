import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/auth-helpers';
import BacktestDashboard from '@/components/backtest/BacktestDashboard';

export default async function BacktestPage() {
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">백테스팅</h1>
        <p className="text-muted-foreground">
          투자 전략의 과거 성과를 분석하고 검증하세요
        </p>
      </div>

      <BacktestDashboard userId={user.id} />
    </div>
  );
}
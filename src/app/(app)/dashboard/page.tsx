import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/auth-helpers';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          포트폴리오 현황과 시장 동향을 한눈에 확인하세요
        </p>
      </div>

      <DashboardContent userId={user.id} />
    </div>
  );
}
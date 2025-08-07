import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/supabase/auth-helpers';
import PortfolioList from '@/components/portfolio/PortfolioList';

export default async function PortfolioPage() {
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">포트폴리오</h1>
          <p className="text-muted-foreground">
            포트폴리오를 관리하고 성과를 추적하세요
          </p>
        </div>
      </div>

      <PortfolioList userId={user.id} />
    </div>
  );
}
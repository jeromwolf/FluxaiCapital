'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePortfolios, portfolioMutations } from '@/hooks/useApi';
import { Plus, Edit2, Trash2, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveCard } from '@/components/ui/responsive-card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';

export default function PortfolioPage() {
  const { data: session } = useSession();
  const { data: portfolios, error, isLoading, mutate: refreshPortfolios } = usePortfolios(session?.user?.id);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newPortfolio, setNewPortfolio] = React.useState({
    name: '',
    description: '',
    currency: 'KRW'
  });
  const router = useRouter();

  const handleCreatePortfolio = async () => {
    if (!session?.user?.id) return;
    
    setIsCreating(true);
    try {
      await portfolioMutations.create({
        userId: session.user.id,
        name: newPortfolio.name,
        description: newPortfolio.description,
        currency: newPortfolio.currency
      });
      
      // Reset form
      setNewPortfolio({ name: '', description: '', currency: 'KRW' });
      
      // Refresh portfolios list
      refreshPortfolios();
      
      // Close dialog
      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
      closeButton?.click();
    } catch (error) {
      console.error('Failed to create portfolio:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('정말로 이 포트폴리오를 삭제하시겠습니까?')) return;
    
    try {
      await portfolioMutations.delete(portfolioId);
      refreshPortfolios();
    } catch (error) {
      console.error('Failed to delete portfolio:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">포트폴리오를 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            포트폴리오 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            투자 포트폴리오를 생성하고 관리하세요
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 포트폴리오
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 포트폴리오 만들기</DialogTitle>
              <DialogDescription>
                투자 목적에 맞는 포트폴리오를 생성하세요
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">포트폴리오 이름</Label>
                <Input
                  id="name"
                  placeholder="예: 성장주 포트폴리오"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택사항)</Label>
                <Textarea
                  id="description"
                  placeholder="투자 전략이나 목표를 입력하세요"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currency">기준 통화</Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newPortfolio.currency}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, currency: e.target.value })}
                >
                  <option value="KRW">KRW (원화)</option>
                  <option value="USD">USD (달러)</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  data-dialog-close
                >
                  취소
                </Button>
                <Button
                  onClick={handleCreatePortfolio}
                  disabled={!newPortfolio.name || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    '생성하기'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {portfolios?.length === 0 ? (
        <ResponsiveCard className="p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            포트폴리오가 없습니다
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            첫 번째 포트폴리오를 만들어 투자를 시작하세요
          </p>
        </ResponsiveCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolios?.map((portfolio: any) => (
            <ResponsiveCard key={portfolio.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {portfolio.name}
                  </h3>
                  {portfolio.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {portfolio.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/portfolio/${portfolio.id}/edit`)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePortfolio(portfolio.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">보유 자산</span>
                  <span className="font-medium">{portfolio._count.holdings}개</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">거래 건수</span>
                  <span className="font-medium">{portfolio._count.transactions}건</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">기준 통화</span>
                  <span className="font-medium">{portfolio.currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">상태</span>
                  <span className={cn(
                    "text-sm px-2 py-1 rounded",
                    portfolio.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                  )}>
                    {portfolio.isActive ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link href={`/portfolio/${portfolio.id}`}>
                  <Button className="w-full">
                    포트폴리오 상세보기
                  </Button>
                </Link>
              </div>
            </ResponsiveCard>
          ))}
        </div>
      )}
    </div>
  );
}
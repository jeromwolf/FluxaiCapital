'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2, Code2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const testAccounts = [
  {
    email: 'admin@flux.ai.kr',
    password: 'admin123',
    role: '관리자',
    description: '모든 기능 접근 가능'
  },
  {
    email: 'user@flux.ai.kr',
    password: 'user123',
    role: '일반 사용자',
    description: '기본 포트폴리오 기능'
  },
  {
    email: 'test@flux.ai.kr',
    password: 'test123',
    role: '테스트 계정',
    description: '제한된 기능'
  }
];

export default function DevLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (email: string, password: string) => {
    setIsLoading(email);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(`로그인 실패: ${result.error}`);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(null);
    }
  };

  // 개발 환경이 아닌 경우 리다이렉트
  if (process.env["NODE_ENV"] !== 'development') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">개발자 모드 로그인</CardTitle>
          </div>
          <CardDescription>
            테스트용 계정으로 빠르게 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {testAccounts.map((account) => (
              <Card 
                key={account.email} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleQuickLogin(account.email, account.password)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">{account.role}</div>
                      <div className="text-sm text-muted-foreground">{account.email}</div>
                      <div className="text-xs text-muted-foreground">{account.description}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading === account.email}
                    >
                      {isLoading === account.email ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          로그인 중...
                        </>
                      ) : (
                        '빠른 로그인'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>🔐 테스트 계정 정보:</p>
              <ul className="space-y-1 ml-4">
                <li>• 관리자: admin@flux.ai.kr / admin123</li>
                <li>• 사용자: user@flux.ai.kr / user123</li>
                <li>• 테스트: test@flux.ai.kr / test123</li>
              </ul>
              <p className="text-xs mt-4">
                ⚠️ 이 페이지는 개발 환경에서만 접근 가능합니다.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/login')}
            >
              일반 로그인으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
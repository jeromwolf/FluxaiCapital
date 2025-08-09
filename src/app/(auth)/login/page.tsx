import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <TrendingUp className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">FLUX AI Capital</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">AI 기반 전략적 자산관리 플랫폼</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">로그인</CardTitle>
            <CardDescription>계정에 로그인하여 서비스를 이용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                회원가입
              </Link>
            </div>

            {process.env['NODE_ENV'] === 'development' && (
              <div className="pt-4 border-t">
                <Link
                  href="/dev-login"
                  className="inline-flex w-full items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
                >
                  개발자 모드로 로그인 (테스트용)
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <TrendingUp className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold">FLUX AI Capital</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 기반 전략적 자산관리 플랫폼
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">회원가입</CardTitle>
            <CardDescription>
              새 계정을 만들어 서비스를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                로그인
              </Link>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              가입하면 FLUX AI Capital의{' '}
              <Link href="/terms" className="underline hover:text-foreground">
                이용약관
              </Link>{' '}
              및{' '}
              <Link href="/privacy" className="underline hover:text-foreground">
                개인정보처리방침
              </Link>
              에 동의하게 됩니다.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
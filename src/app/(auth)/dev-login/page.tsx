import { redirect } from 'next/navigation';

export default function DevLoginPage() {
  // 개발 환경에서만 접근 가능
  if (process.env.NODE_ENV !== 'development') {
    redirect('/login');
  }

  // 자동으로 대시보드로 리디렉트
  redirect('/dashboard');
}
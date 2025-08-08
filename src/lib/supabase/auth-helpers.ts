import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth() {
  // 개발 환경에서는 로그인 우회
  if (process.env["NODE_ENV"] === 'development') {
    return {
      id: 'dev-user-123',
      email: 'dev@flux.ai.kr',
      name: '개발자',
    };
  }

  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
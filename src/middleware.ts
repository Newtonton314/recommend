// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // 認証チェックを一時的に無効化
  return res;

  /* 認証チェックをコメントアウト
  const supabase = createMiddlewareClient({
    req,
    res,
  },);

  const { data: { session } } = await supabase.auth.getSession();
  
  // 保護されたルートへのアクセスで、かつセッションがない場合のみリダイレクト
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard');

  if (isProtectedRoute && !session) {
    // 認証されていない場合、ログインページにリダイレクト
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
  */
}

// ミドルウェアを適用するパスを指定
export const config = {
  matcher: [
    '/dashboard/:path*',
  ]
};

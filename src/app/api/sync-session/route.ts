// pages/api/auth/sync-session.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // 認証を一時的に無効化
  return Response.json({ success: true });
  
  /* セッション同期処理をコメントアウト
  const { session } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  // サーバー側でセッション情報を設定
  await supabase.auth.setSession(session);
  
  return Response.json({ success: true });
  */
}
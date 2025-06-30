// pages/api/auth/sync-session.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const { session } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  // サーバー側でセッション情報を設定
  await supabase.auth.setSession(session);
  
  return Response.json({ success: true });
}
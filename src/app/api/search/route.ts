// src/app/api/search/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';      // Edge Function
export const maxDuration = 30;      // Hobby でも有効

export async function POST(req: Request) {
  const { name, university, dob, notes } = await req.json();

  const userPrompt = `以下の人物についてリクルート目的で詳細に情報を調査し、日本語で細かく記述してください。
名前: ${name}
大学: ${university || '(不明)'}
生年月日: ${dob || '(不明)'}
補足情報: ${notes || '(なし)'}`;

  const upstream = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY!}`,
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      stream: false,
      max_tokens: 2048,
      temperature: 0.3,
      messages: [{ role: 'user', content: userPrompt }],
      web_search_options: { search_context_size: 'high' },
    }),
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: await upstream.text() }, { status: upstream.status });
  }

  const data = await upstream.json();
  const result = data.choices[0].message.content;

  return NextResponse.json({ result });
}
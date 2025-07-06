// src/app/api/recommend/route.ts
import { NextResponse } from 'next/server';

// Edge Runtimeを無効化してNode.js Runtimeを使用
// export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  const { jobDescription } = await req.json();

  if (!jobDescription) {
    return NextResponse.json({ error: '求人要件を入力してください' }, { status: 400 });
  }

  const userPrompt = `以下の求人要件に基づいて、web上の情報（特にsnsやresearchmap）から適切な候補者を7名見つけてください。
各候補者について以下の情報を含めてください：
- 名前・年齢
- 現在の所属・役職
- 専門分野・スキル
- 主な実績（論文、プロジェクト、開発経験など）
- この求人とのマッチ度（0-100点）とその理由
- 参考URL（ResearchMap、Twitter、GitHub、個人サイトなど）

求人要件：
${jobDescription}

必ず以下のJSON形式のみで回答してください。説明文や前置きは不要です：
[
  {
    "name": "候補者名",
    "currentPosition": "現在の所属・役職",
    "profileSummary": "プロフィール要約",
    "relevanceScore": 85,
    "matchingReason": "マッチング理由",
    "skills": ["スキル1", "スキル2"],
    "achievements": ["実績1", "実績2"],
    "referenceLinks": ["URL1", "URL2"]
  }
]`;

  // APIキーの確認（最初の数文字のみログ出力）
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Perplexity APIキーが設定されていません' }, { status: 500 });
  }
  console.log('API Key prefix:', apiKey.substring(0, 10) + '...');

  try {
    const upstream = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',  // sonar-proからsonarに変更
        stream: true,
        max_tokens: 4096,
        temperature: 0.3,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

  if (!upstream.ok) {
    const errorText = await upstream.text();
    console.error('Perplexity API Error:', errorText);
    return NextResponse.json({ 
      error: `Perplexity API エラー: ${upstream.status} - ${errorText}` 
    }, { status: upstream.status });
  }

    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ 
      error: 'ネットワークエラーが発生しました。しばらくしてから再度お試しください。' 
    }, { status: 500 });
  }
}
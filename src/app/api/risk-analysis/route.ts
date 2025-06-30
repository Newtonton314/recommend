import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { findings } = await request.json();

    if (!findings) {
      console.error('No findings provided');
      return NextResponse.json(
        { error: '調査結果が提供されていません' },
        { status: 400 }
      );
    }

    console.log('Received findings:', findings);

    const prompt = `あなたは人事部門のリスクアナリストです。
以下の「調査結果」を参考に、候補者に関連する採用リスクを
1) 箇条書き〔最大5行〕
2) 総合リスクスコア (1=極小〜5=極大)
の形式で日本語で出力してください。

調査結果:
${findings}`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    console.log('Received response from OpenAI');
    const analysis = completion.choices[0].message.content;

    if (!analysis) {
      console.error('No analysis content received from OpenAI');
      return NextResponse.json(
        { error: 'リスク分析の結果が空です' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Risk analysis error:', error);
    return NextResponse.json(
      { error: 'リスク分析に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー') },
      { status: 500 }
    );
  }
} 
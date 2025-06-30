import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// デバッグ用のログ
console.log('API Key available:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // デバッグ用のログ
    console.log('API Key in request:', !!process.env.OPENAI_API_KEY);
    
    const body = await request.json();
    const { name, university, birthDate, additionalInfo } = body;

    if (!name || !university || !birthDate) {
      return NextResponse.json(
        { error: "名前、大学、生年月日は必須項目です" },
        { status: 400 }
      );
    }

    const prompt = `
以下の情報に基づいて、人物のリスク分析を行ってください：

名前: ${name}
大学: ${university}
生年月日: ${birthDate}
補足情報: ${additionalInfo || "なし"}

以下の観点から分析をお願いします：
1. 基本的な信頼性
2. 潜在的なリスク要因
3. 推奨される注意点
4. 総合的な評価

分析結果は日本語で出力してください。
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
    return NextResponse.json({message: "Hello"}, { status: 200 });
}


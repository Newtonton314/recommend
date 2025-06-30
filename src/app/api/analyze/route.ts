import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { name, university, birthDate, additionalInfo } = await request.json();

    const prompt = `
以下の人物情報に基づいて、リスク分析を行ってください。
情報が不足している場合は、その旨を指摘してください。

名前: ${name}
出身大学: ${university}
生年月日: ${birthDate}
補足情報: ${additionalInfo}

以下の観点で分析してください：
1. 学歴・経歴の信頼性
2. 社会的なリスク要因
3. その他の注意点

分析結果は箇条書きで簡潔にまとめてください。
`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return NextResponse.json({
      analysis: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { error: "分析中にエラーが発生しました。" },
      { status: 500 }
    );
  }
} 
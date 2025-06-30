import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { findings } = await req.json();
    if (!findings) {
      return NextResponse.json({ error: "findings がありません" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",         
      messages: [
        {
          role: "system",
          content:
            "あなたはリスクアナリストです。与えられた要約文だけを根拠に客観的なリスク評価を行い、日本語で出力してください。",
        },
        { role: "user", content: findings },
      ],
    });

    const analysis = completion.choices[0].message.content;
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "リスク分析に失敗しました" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Risk API ready" });
}

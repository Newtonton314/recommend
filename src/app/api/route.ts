/* src/app/api/route.ts */
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { name, university, birthDate, additionalInfo } = await request.json();
    if (!name || !university || !birthDate) {
      return NextResponse.json(
        { error: "名前、大学、生年月日は必須項目です" },
        { status: 400 }
      );
    }

    const pplxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        stream: false,
        messages: [
          {
            role: "user",
            content: `
以下の人物についてインターネット情報を調査し、要約してください。
- 名前: ${name}
- 大学: ${university}
- 生年月日: ${birthDate}
- 補足: ${additionalInfo || "なし"}
            `.trim(),
          },
        ],
      }),
    });
    if (!pplxRes.ok) {
      const txt = await pplxRes.text();
      throw new Error(`Perplexity error: ${txt.slice(0, 200)}`);
    }
    const pplxJson = await pplxRes.json();
    const summary: string = pplxJson.choices[0].message.content;
    const citations =
      (pplxJson.choices[0].citations as { url: string; text?: string }[]) ?? [];

    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "あなたはリスクアナリストです。与えられた要約文のみを根拠に、" +
            "1)基本的信頼性 2)潜在リスク 3)注意点 4)総合評価 を日本語で簡潔にまとめてください。",
        },
        { role: "user", content: summary },
      ],
    });
    const analysis = completion.choices[0].message.content;

    return NextResponse.json({ summary, citations, analysis }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
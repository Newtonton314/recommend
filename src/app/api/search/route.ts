import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, university, dob, notes } = await req.json();

    const pplxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        stream: false,
        web_access: true,
        messages: [
          {
            role: "user",
            content: `
人物情報をまとめてください：
- 名前: ${name}
- 大学: ${university || "不明"}
- 生年月日: ${dob || "不明"}
- 補足: ${notes || "なし"}
            `.trim(),
          },
        ],
      }),
    });

    if (!pplxRes.ok) {
      const txt = await pplxRes.text();
      throw new Error(`Perplexity error: ${txt.slice(0, 200)}`);
    }

    const data = await pplxRes.json();
    console.debug("🛰️ Perplexity raw", JSON.stringify(data, null, 2));

    const result: string = data.choices[0].message.content;
    const citations = (data.citations as string[]).map((u) => ({ url: u })); // ← 修正

    return NextResponse.json({ result, citations }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "検索に失敗しました" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}

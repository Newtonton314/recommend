"use client";

import React, { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormData {
  name: string;
  university: string;
  dob: string;
  notes: string;
}

export default function HomePage() {
  // ─── State ───────────────────────────────────────────
  const [form, setForm] = useState<FormData>({
    name: "",
    university: "",
    dob: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");       // ← string に変更
  const [error, setError] = useState<string | null>(null);

  // ─── Handlers ────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult("");

    // API 呼び出し
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.body) {
      setLoading(false);
      setError("No response body");
      return;
    }

    // ── ストリーミング読み取り ─────────────────────
    const reader  = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let   buffer  = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      for (const line of lines.slice(0, -1)) {
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (jsonStr === "[DONE]") {
          setLoading(false);
          return;
        }
        try {
          const delta =
            JSON.parse(jsonStr)?.choices?.[0]?.delta?.content ?? "";
          if (delta) setResult((prev) => prev + delta);
        } catch {
          /* まだ JSON が切れている chunk は無視 */
        }
      }
      buffer = lines.at(-1) || "";
    }
    setLoading(false);
  }

  // ─── UI ─────────────────────────────────────────────
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-center mb-8">Survey AI</h1>

      <div className="md:grid md:grid-cols-2 md:gap-12">
        {/* ---- Left: Input form ---- */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded-lg shadow-lg border border-gray-300"
        >
          {/* 名前 */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="name">
              名前<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="例）山田 太郎"
              className="w-full border-2 border-black rounded px-3 py-2"
            />
          </div>

          {/* 大学 */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="university">
              大学
            </label>
            <input
              id="university"
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="例）東京大学"
              className="w-full border-2 border-black rounded px-3 py-2"
            />
          </div>

          {/* 生年月日 */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="dob">
              生年月日
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              className="w-full border-2 border-black rounded px-3 py-2"
            />
          </div>

          {/* 補足情報 */}
          <div>
            <label className="block mb-1 font-medium" htmlFor="notes">
              補足情報
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handleChange}
              placeholder="ポジション希望・研究テーマなど"
              className="w-full border-2 border-black rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "検索中…" : "検索"}
          </button>

          {error && <p className="text-red-600">{error}</p>}
        </form>

        {/* ---- Right: Result panel ---- */}
        <section className="mt-8 md:mt-0 bg-white p-6 rounded-lg shadow-lg border border-gray-300 h-fit">
          <h2 className="font-semibold mb-4">調査結果</h2>

          {loading && <p className="text-sm text-gray-500">検索中です…</p>}

          {result ? (
            <div className="prose prose-sm break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          ) : (
            !loading && (
              <p className="text-sm text-gray-500">
                左のフォームに情報を入力し「検索」を押すとここに結果が表示されます。
              </p>
            )
          )}
        </section>
      </div>
    </main>
  );
}
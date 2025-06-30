"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Citation {
  url: string;
  text?: string;
  title?: string;
}

interface SearchResponse {
  result: string;
  citations: Citation[];
}

const mock: SearchResponse = {
  result: "テスト結果です。これは[リンクテキスト](https://example.com)を含むマークダウンです。",
  citations: [
    { text: "テストリンク", url: "https://example.com" }
  ]
};

export default function TestLinks() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">リンクテスト</h1>
      
      <div className="prose prose-sm break-words mb-8">
        <h2 className="text-xl font-semibold mb-2">ReactMarkdown テスト</h2>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
              />
            )
          }}
        >
          {mock.result}
        </ReactMarkdown>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold mb-2">直接リンクテスト</h2>
        {mock.citations.map((citation, index) => (
          <div key={index} className="text-sm text-gray-600">
            {citation.text}
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline text-blue-600 cursor-pointer"
            >
              [参照]
            </a>
          </div>
        ))}
      </div>
    </div>
  );
} 
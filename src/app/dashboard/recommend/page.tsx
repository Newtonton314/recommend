'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, User, Building, Target } from "lucide-react";

interface Candidate {
  name: string;
  currentPosition: string;
  profileSummary: string;
  relevanceScore: number;
  matchingReason: string;
  skills: string[];
  achievements: string[];
  referenceLinks: string[];
}

export default function RecommendPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
      setError('求人要件を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setCandidates([]);
    setDebugInfo('');

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '検索に失敗しました');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let chunkCount = 0;


      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue; // 空行をスキップ
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            chunkCount++;
            
            if (data === '[DONE]') {
              // ストリーミング終了時に全体をパース
              
              // デバッグ情報を必ず表示
              setDebugInfo(fullContent);
              
              try {
                // 複数のパターンでJSONを探す
                let candidates = null;
                
                // パターン1: 全体がJSON配列
                try {
                  const trimmed = fullContent.trim();
                  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                    candidates = JSON.parse(trimmed);
                  }
                } catch (e) {
                  // Pattern 1 failed
                }
                
                // パターン2: 正規表現でJSON配列を抽出（非貪欲マッチを貪欲に変更）
                if (!candidates) {
                  const jsonMatch = fullContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
                  if (jsonMatch) {
                    try {
                      candidates = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                      // Pattern 2 failed
                    }
                  }
                }
                
                // パターン3: 最初の[から最後の]まで
                if (!candidates) {
                  const start = fullContent.indexOf('[');
                  const end = fullContent.lastIndexOf(']');
                  if (start !== -1 && end !== -1 && end > start) {
                    try {
                      const jsonStr = fullContent.substring(start, end + 1);
                      candidates = JSON.parse(jsonStr);
                    } catch (e) {
                      // Pattern 3 failed
                    }
                  }
                }
                
                if (candidates && Array.isArray(candidates) && candidates.length > 0) {
                  setCandidates(candidates);
                  setDebugInfo(''); // 成功時のみクリア
                } else {
                  setError('候補者データの解析に失敗しました。デバッグ情報を確認してください。');
                }
              } catch (e) {
                console.error('Unexpected error:', e);
                setError('予期しないエラーが発生しました。');
              }
              continue;
            }
            
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              
              if (content) {
                fullContent += content;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
      
      // ストリームが終了してもfullContentがあれば処理を試みる
      if (fullContent && !candidates.length) {
        try {
          const trimmed = fullContent.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const parsedCandidates = JSON.parse(trimmed);
            if (Array.isArray(parsedCandidates)) {
              setCandidates(parsedCandidates);
              setDebugInfo('');
            }
          }
        } catch (e) {
          setDebugInfo(fullContent);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">候補者レコメンド</h1>
      

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>求人要件入力</CardTitle>
          <CardDescription>
            求人票の内容を入力すると、マッチする候補者を自動で検索します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="例：東京大学 松尾・岩澤研究室でLLM開発エンジニアを募集しています。大規模言語モデルの研究開発経験があり、PythonとPyTorchに精通している方を求めています..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[200px] mb-4"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !jobDescription.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? '検索中...' : '候補者を検索'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* デバッグ情報の表示 */}
      {debugInfo && !candidates.length && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>デバッグ情報（Perplexity APIレスポンス）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm whitespace-pre-wrap">{debugInfo}</pre>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ※ 上記のレスポンスからJSON形式の候補者データを抽出できませんでした。
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && candidates.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">
            マッチング候補者 ({candidates.length}名)
          </h2>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>候補者</TableHead>
                  <TableHead>スコア</TableHead>
                  <TableHead>スキル</TableHead>
                  <TableHead>マッチング理由</TableHead>
                  <TableHead>リンク</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.currentPosition}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          candidate.relevanceScore >= 90 ? 'default' : 
                          candidate.relevanceScore >= 80 ? 'secondary' : 
                          'outline'
                        }
                        className={
                          candidate.relevanceScore >= 90 ? 'bg-green-500 hover:bg-green-600 text-white' : 
                          candidate.relevanceScore >= 80 ? 'bg-blue-500 hover:bg-blue-600 text-white' : 
                          ''
                        }
                      >
                        {candidate.relevanceScore}点
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm line-clamp-2">{candidate.matchingReason}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {candidate.referenceLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden space-y-4">
            {candidates.map((candidate, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      <CardDescription>{candidate.currentPosition}</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        candidate.relevanceScore >= 90 ? 'default' : 
                        candidate.relevanceScore >= 80 ? 'secondary' : 
                        'outline'
                      }
                      className={
                        candidate.relevanceScore >= 90 ? 'bg-green-500 hover:bg-green-600' : 
                        candidate.relevanceScore >= 80 ? 'bg-blue-500 hover:bg-blue-600' : 
                        ''
                      }
                    >
                      {candidate.relevanceScore}点
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">プロフィール</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.profileSummary}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">マッチング理由</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.matchingReason}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">スキル</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">実績</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {candidate.achievements.slice(0, 3).map((achievement, i) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">参考リンク</p>
                      <div className="flex gap-2">
                        {candidate.referenceLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Link {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
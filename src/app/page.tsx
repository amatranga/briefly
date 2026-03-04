"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopicSelector } from '@/components/TopicSelector';
import { BriefResults } from '@/components/BriefResults';
import { Spinner } from '@/components/Spinner';
import { TOPICS, type Topic } from '@/lib/sources';
import type { Article } from '@/lib/types';

const articleLimit = 5;
const DEFAULT_TOPICS: Topic[] = ["business"];

const parseTopics = (param: string | null): Topic[] => {
  if (!param) return DEFAULT_TOPICS;
  const allowed = new Set(TOPICS);
  const parsed = param
    .split(",")
    .map(p => p.trim())
    .filter((t): t is Topic => allowed.has(t as Topic));

  return parsed.length ? parsed : DEFAULT_TOPICS;
}

const parseLimit = (param: string | null): number => {
  const n = Number(param);
  return Number.isFinite(n) && n >= 1 && n <= 10 ? n : articleLimit;
}

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [topics, setTopics] = useState<Topic[]>(() => parseTopics(searchParams.get("topics")));
  const [limit, setLimit] = useState<number>(() => parseLimit(searchParams.get("limit")));
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [cache, setCache] = useState<"hit" | "miss" | null>(null);

  useEffect(() => {
    const topicsParam = topics.slice().sort().join(",");
    router.replace(`/?topics=${encodeURIComponent(topicsParam)}&limit=${limit}`);
  }, [topics, limit, router]);

  const generateBrief = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, limit: articleLimit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setArticles(data.items ?? []);
      setLastUpdated(data.lastUpdated ?? null);
      setCache(data.cache ?? null);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Briefly</h1>
        <p className="small" style={{ marginTop: 6 }}>
          Pick topics and generate a quick daily brief.
        </p>

        <TopicSelector value={topics} onChange={setTopics} />

        <button
          className="primary"
          onClick={generateBrief}
          disabled={loading || topics.length === 0}
          style={{ opacity: loading ? 0.85 : 1 }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Spinner /> Generating...
            </span>
          ) : (
            "Generate Brief"
          )}
        </button>

        {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
      </div>

      {lastUpdated && (
        <p className="small" style={{ marginTop: 12 }}>
          Last updated: {new Date(lastUpdated).toISOString()}
          {cache ? ` (${cache})` : ""}
        </p>
      )}

      <BriefResults articles={articles} />
    </main>
  );
}

export default HomePage;

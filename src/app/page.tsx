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

const safeGet = (key: string) => {
  // Get a value from localStorage
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

const safeSet = (key: string, val: string) => {
  // Set a key/value in localStorage
  try {
    localStorage.setItem(key, val);
  } catch {}
}

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [topics, setTopics] = useState<Topic[]>(() => parseTopics(searchParams.get("topics")));
  const [limit, setLimit] = useState<number>(() => parseLimit(searchParams.get("limit")));
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [cache, setCache] = useState<"hit" | "miss" | null>(null);

  useEffect(() => {
    const urlTopics = searchParams.get("topics");
    const urlLimit = searchParams.get("limit");
    const savedTheme = safeGet("briefly:theme");

    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);

    if (!urlTopics) {
      const saved = safeGet("briefly:topics");
      if (saved) setTopics(parseTopics(saved));
    }

    if (!urlLimit) {
      const saved = safeGet("briefly:limit");
      if (saved) setLimit(parseLimit(saved));
    }
  }, []);

  // Set topics and limit in local storage on update
  useEffect(() => safeSet("briefly:topics", topics.join(",")), [topics]);
  useEffect(() => safeSet("briefly:limit", String(limit)), [limit]);

  // Set theme in local storage on update
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    safeSet("briefly:theme", theme);
  }, [theme]);

  // When topics and limits change, update the URL
  useEffect(() => {
    const topicsParam = topics.slice().sort().join(",");
    router.replace(`/?topics=${encodeURIComponent(topicsParam)}&limit=${limit}`);
  }, [topics, limit, router]);

  const generateBrief = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, limit, force }),
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
    <div className="card" style={{ marginBottom: 16 }}>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <h1 style={{ margin: 0 }}>Briefly</h1>

        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          style={{
            border: "1px solid var(--border)",
            background: "transparent",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <p className="small" style={{ marginTop: 6 }}>
        Pick topics and generate a quick daily brief.
      </p>

      <TopicSelector value={topics} onChange={setTopics} />

      <button
        className="primary"
        onClick={() => generateBrief(false)}
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

      <button
        className="primary"
        onClick={() => generateBrief(true)}
        disabled={loading || topics.length === 0}
        style={{ marginLeft: 10, background: "transparent", color: "var(--text)" }}
      >
        Regenerate
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      {lastUpdated && (
        <p className="small" style={{ marginTop: 12 }}> 
          Last updated: {new Date(lastUpdated).toISOString()} {cache ? `(${cache})` : ""} 
        </p>
      )}
          
      <BriefResults articles={articles} />

    </div>
  );
}

export default HomePage;

"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopicSelector } from '@/components/TopicSelector';
import { BookmarksView } from '@/components/BookmarksView';
import { HistoryView } from '@/components/HistoryView';
import { BriefLogView } from '@/components/BriefLogView';
import { BriefView } from '@/components/BriefView';
import { TopicWeightsEditor } from '@/components/TopicWeightsEditor';
import { TOPICS, VIEWS } from '@/lib/types';
import type { CacheStatus, Topic, View, TopicWeights, UserPreferences } from '@/lib/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { saveBriefSnapshot } from '@/lib/brief';
import { DEFAULT_TOPIC_WEIGHTS } from '@/lib/sources';
import { getUserPreferences, resetUserPreferences } from '@/lib/preferences';
import { LearnedTopicAffinities } from '@/components/LearnedTopicAffinities';

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

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [topics, setTopics] = useState<Topic[]>(() => parseTopics(searchParams.get("topics")));
  const [limit, setLimit] = useState<number>(() => parseLimit(searchParams.get("limit")));
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [cache, setCache] = useState<CacheStatus>(null);
  const [view, setView] = useState<View>("brief");
  const [showSettings, setShowSettings] = useState(false);
  const [topicWeights, setTopicWeights] = useState<TopicWeights>(DEFAULT_TOPIC_WEIGHTS);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    const urlTopics = searchParams.get("topics");
    const urlLimit = searchParams.get("limit");
    const savedTheme = loadJSON("briefly:theme", null);
    const savedWeights = loadJSON("briefly:topicWeights", null);

    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);

    if (!urlTopics) {
      const saved = loadJSON("briefly:topics", null);
      if (saved) setTopics(parseTopics(saved));
    }

    if (!urlLimit) {
      const saved = loadJSON("briefly:limit", null);
      if (saved) setLimit(parseLimit(saved));
    }

    if (savedWeights) setTopicWeights(savedWeights);

    setUserPreferences(getUserPreferences());
  }, []);

  // Set topics and limit in local storage on update
  useEffect(() => saveJSON("briefly:topics", topics.join(",")), [topics]);
  useEffect(() => saveJSON("briefly:limit", String(limit)), [limit]);

  // Set theme in local storage on update
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveJSON("briefly:theme", theme);
  }, [theme]);

  // Set topic weightsin local storage on update
  useEffect(() => {
    saveJSON("briefly:topicWeights", topicWeights);
  }, [topicWeights]);

  // When topics and limits change, update the URL
  useEffect(() => {
    const topicsParam = topics.slice().sort().join(",");
    router.replace(`/?topics=${encodeURIComponent(topicsParam)}&limit=${limit}`);
  }, [topics, limit, router]);

  useEffect(() => {
    if (showSettings) {
      setUserPreferences(getUserPreferences());
    }
  }, [showSettings]);

  const generateBrief = async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          limit,
          force,
          topicWeights,
          userPreferences: getUserPreferences(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setArticles(data.items ?? []);
      setLastUpdated(data.lastUpdated ?? null);
      setCache(data.cache ?? null);

      // v1.2: save snapshot
      saveBriefSnapshot({
        topics,
        limit,
        items: data.items ?? [],
        cache: data.cache ?? null,
        errors: data.errors ?? [],
      });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">

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

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                border: "1px solid var(--border)",
                background: view === v ? "var(--card)" : "transparent",
                borderRadius: 999,
                padding: "6px 10px",
                cursor: "pointer",
                color: "var(--text)",
                fontWeight: view === v ? 700 : 500,
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        
        <TopicSelector value={topics} onChange={setTopics} />

        <div style={{ marginTop: 12, marginBottom: 16 }}>
          <button
            onClick={() => setShowSettings(prev => !prev)}
            style={{
              border: "1px solid var(--border)",
              background: "transparent",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
              color: "var(--text)",
            }}
          >
            {showSettings ? "Hide Settings" : "Show Settings"}
          </button>
        
          {showSettings && (
            <div className="card" style={{ marginTop: 12, padding: "16 "}}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Settings</h3>
              <TopicWeightsEditor
                topics={topics}
                weights={topicWeights}
                onChange={setTopicWeights}
              />

              {userPreferences && (
                <>
                  <LearnedTopicAffinities preferences={userPreferences} />

                  <button
                    onClick={() => setUserPreferences(resetUserPreferences())}
                    style={{
                      marginTop: 12,
                      border: "1px solid var(--border)",
                      background: "transparent",
                      borderRadius: 8,
                      padding: "6px 10px",
                      cursor: "pointer",
                      color: "var(--text)",
                    }}
                  >
                    Reset Personalization
                  </button>
                </>
              )}
            </div>
          )}
        </div>


        {view === "brief" && (
          <BriefView
            topicsCount={topics.length}
            articles={articles}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            cache={cache}
            onGenerate={() => generateBrief(false)}
            onRegenerate={() => generateBrief(true)}
          />
        )}
        {view === "bookmarks" && <BookmarksView />}
        {view === "history" && <HistoryView />}
        {view === "briefs" && (
          <BriefLogView onLoadBrief={snapshot => {
            setArticles(snapshot.items);
            setLastUpdated(snapshot.generatedAt);
            setCache(snapshot.cache ?? null);
            setLimit(snapshot.limit);
            setView("brief");
            }}
          />
        )}
      </div>

    </main>
  );
}

export default HomePage;

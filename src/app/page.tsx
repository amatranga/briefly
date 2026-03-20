"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopicSelector } from "@/components/TopicSelector";
import { BookmarksView } from "@/components/BookmarksView";
import { HistoryView } from "@/components/HistoryView";
import { BriefLogView } from "@/components/BriefLogView";
import { BriefView } from "@/components/BriefView";
import { FeedView } from "@/components/FeedView";
import { Header } from "@/components/Header";
import { ViewSelector } from "@/components/ViewSelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import type {
  Article,
  CacheStatus,
  Topic,
  TopicWeights,
  UserPreferences,
  View,
} from "@/lib/types";
import { loadJSON, saveJSON } from "@/lib/storage";
import { saveBriefSnapshot } from "@/lib/brief";
import { DEFAULT_TOPIC_WEIGHTS } from "@/lib/sources";
import { getUserPreferences, resetUserPreferences } from "@/lib/preferences";
import { parseTopics, parseLimit, dedupeArticlesByLink } from "@/lib/helpers";

const feedPageSize = 10;

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [topics, setTopics] = useState<Topic[]>(() => parseTopics(searchParams.get("topics")));
  const [limit, setLimit] = useState<number>(() => parseLimit(searchParams.get("limit")));

  const [briefArticles, setBriefArticles] = useState<Article[]>([]);
  const [feedArticles, setFeedArticles] = useState<Article[]>([]);

  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [cache, setCache] = useState<CacheStatus>(null);

  const [view, setView] = useState<View>("brief");
  const [showSettings, setShowSettings] = useState(false);
  const [topicWeights, setTopicWeights] = useState<TopicWeights>(DEFAULT_TOPIC_WEIGHTS);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  const [feedOffset, setFeedOffset] = useState(0);
  const [feedHasMore, setFeedHasMore] = useState(true);

  const didBootstrapRef = useRef(false);

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
  }, [searchParams]);

  useEffect(() => saveJSON("briefly:topics", topics.join(",")), [topics]);
  useEffect(() => saveJSON("briefly:limit", String(limit)), [limit]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveJSON("briefly:theme", theme);
  }, [theme]);

  useEffect(() => {
    saveJSON("briefly:topicWeights", topicWeights);
  }, [topicWeights]);

  useEffect(() => {
    const topicsParam = topics.slice().sort().join(",");
    router.replace(`/?topics=${encodeURIComponent(topicsParam)}&limit=${limit}`);
  }, [topics, limit, router]);

  useEffect(() => {
    if (showSettings) {
      setUserPreferences(getUserPreferences());
    }
  }, [showSettings]);

  const generateBrief = useCallback(async (force = false) => {
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

      if (!res.ok) {
        throw new Error(data?.error ?? "Request failed");
      }

      const nextItems = (data.items ?? []) as Article[];

      setBriefArticles(nextItems);
      setLastUpdated(data.lastUpdated ?? null);
      setCache(data.cache ?? null);

      saveBriefSnapshot({
        topics,
        limit,
        items: nextItems,
        cache: data.cache ?? null,
        errors: data.errors ?? [],
      });
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [topics, limit, topicWeights]);

  const loadFeedPage = useCallback(
    async ({ reset = false }: { reset?: boolean } = {}) => {
      if (reset) {
        setFeedLoading(true);
      } else {
        setFeedLoadingMore(true);
      }

      setFeedError(null);

      try {
        const res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics,
            limit: feedPageSize,
            offset: reset ? 0 : feedOffset,
            topicWeights,
            userPreferences: getUserPreferences(),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error ?? "Feed request failed");
        }

        const nextItems = (data.items ?? []) as Article[];

        if (reset) {
          setFeedArticles(dedupeArticlesByLink(nextItems));
          setFeedOffset(nextItems.length);
        } else {
          setFeedArticles(prev => {
            const merged = dedupeArticlesByLink([...prev, ...nextItems]);
            setFeedOffset(merged.length);
            return merged;
          });
        }

        if (typeof data.hasMore === "boolean") {
          setFeedHasMore(data.hasMore);
        } else {
          setFeedHasMore(nextItems.length === feedPageSize);
        }
      } catch (e: any) {
        setFeedError(e?.message ?? "Something went wrong");
      } finally {
        setFeedLoading(false);
        setFeedLoadingMore(false);
      }
    },
    [topics, feedOffset, topicWeights]
  );

  useEffect(() => {
    if (didBootstrapRef.current) return;
    didBootstrapRef.current = true;

    void generateBrief(false);
    void loadFeedPage({ reset: true });
  }, [generateBrief, loadFeedPage]);

  useEffect(() => {
    if (!didBootstrapRef.current) return;

    setFeedOffset(0);
    setFeedHasMore(true);
    void loadFeedPage({ reset: true });
  }, [topics, topicWeights, loadFeedPage]);

  return (
    <main className="container">
      <div className="card" style={{ marginBottom: 16 }}>
        <Header
          theme={theme}
          onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        />

        <ViewSelector view={view} onChange={setView} />

        <TopicSelector value={topics} onChange={setTopics} />

        <SettingsPanel
          showSettings={showSettings}
          onToggle={() => setShowSettings(prev => !prev)}
          topics={topics}
          topicWeights={topicWeights}
          onTopicWeightsChange={setTopicWeights}
          userPreferences={userPreferences}
          onResetPersonalization={() => setUserPreferences(resetUserPreferences())}
        />

        {view === "brief" && (
          <BriefView
            topicsCount={topics.length}
            articles={briefArticles}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            cache={cache}
            onGenerate={() => generateBrief(false)}
            onRegenerate={() => generateBrief(true)}
          />
        )}

        {view === "feed" && (
          <FeedView
            articles={feedArticles}
            loading={feedLoading}
            loadingMore={feedLoadingMore}
            error={feedError}
            hasMore={feedHasMore} 
            onLoadMore={() => {
              if (!feedLoading && !feedLoadingMore && feedHasMore) {
                void loadFeedPage();
              }
            }}
          />
        )}

        {view === "bookmarks" && <BookmarksView />}
        {view === "history" && <HistoryView />}

        {view === "briefs" && (
          <BriefLogView
            onLoadBrief={snapshot => {
              setBriefArticles(snapshot.items);
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
};

export default HomePage;

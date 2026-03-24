"use client";

import { useEffect, useRef } from "react";
import type { Article } from "@/lib/types";
import { BriefResults } from "@/components/BriefResults";
import { Spinner } from "@/components/Spinner";

type FeedViewProps = {
  articles: Article[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: () => void;
};

const FeedView = ({
  articles,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
  onRetry,
}: FeedViewProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  if (!hasMore || loading || loadingMore || error) return;

  const node = sentinelRef.current;
  if (!node) return;

  const observer = new IntersectionObserver(
    entries => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        onLoadMore();
      }
    },
    {
      root: null,
      rootMargin: "300px 0px",
      threshold: 0,
    }
  );

  observer.observe(node);

  return () => observer.disconnect();
}, [hasMore, loading, loadingMore, error, onLoadMore]);

  if (loading && !articles.length) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Spinner />
          <span className="small">Loading your feed...</span>
        </div>
      </div>
    );
  }

  if (error && !articles.length) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p className="small" style={{ margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Your Feed</h2>

      <BriefResults articles={articles} />

      {error ? (
        <p className="small" style={{ marginTop: 12 }}>{error}</p>
      ) : null}

      {error && articles.length ? (
        <div style={{ marginTop: 12 }}>
          <p className="small" style={{ marginBottom: 8 }}>{error}</p>
          {onRetry ? (
            <button
              onClick={onRetry}
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                color: "var(--text)",
              }}
            >
              Retry loading more
            </button>
          ) : null}
        </div>
      ) : null}

      {loadingMore ? (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Spinner />
          <span className="small">Loading more...</span>
        </div>
      ) : null}

      {!hasMore && articles.length ? (
        <p className="small" style={{ marginTop: 12 }}>
          You’ve reached the end of the feed.
        </p>
      ) : null}

      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
    </section>
  );
};

export { FeedView };

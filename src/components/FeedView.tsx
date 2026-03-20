"use client";

import { useEffect, useRef } from "react";
import type { Article } from "@/lib/types";
import { isBookmarked } from "@/lib/bookmark";
import { isRead } from "@/lib/history";
import { getArticleFeedback } from "@/lib/preferences";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { ArticleMetaData } from "@/components/ArticleMetaData";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ArticleContent } from "@/components/ArticleContent";
import { Spinner } from "@/components/Spinner";

type FeedViewProps = {
  articles: Article[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
};

const FeedView = ({
  articles,
  loading,
  loadingMore,
  error,
  hasMore,
  onLoadMore,
}: FeedViewProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;

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
  }, [hasMore, loading, loadingMore, onLoadMore]);

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
        <p className="small" style={{ margin: 0 }}>
          {error}
        </p>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="card" style={{ marginTop: 24 }}>
        <p className="small" style={{ margin: 0 }}>
          No feed articles yet.
        </p>
      </div>
    );
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Your Feed</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {articles.map(article => {
          const descriptionText =
            article.summary ?? article.description ?? "No summary available.";

          const bookmarked = isBookmarked(article.link);
          const read = isRead(article.link);
          const feedback = getArticleFeedback(article.link);

          return (
            <li key={article.link} className="card" style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div className="small" style={{ marginBottom: 6 }}>
                  <ArticleMetaData
                    sourceName={article.sourceName}
                    publishedAt={article.publishedAt}
                    read={read}
                  />

                  <ArticleFeedback
                    article={article}
                    value={feedback}
                    onChange={() => {
                      // child handles persistence; parent feed stays source-light
                    }}
                  />
                </div>

                <BookmarkButton
                  article={article}
                  bookmarked={bookmarked}
                  onChange={() => {
                    // child handles persistence; feed does not need local bookmark state
                  }}
                />
              </div>

              <ArticleContent
                article={article}
                descriptionText={descriptionText}
                onRead={() => {
                  // child handles persistence; feed reads from history helpers on render
                }}
              />
            </li>
          );
        })}
      </ul>

      {error ? (
        <p className="small" style={{ marginTop: 12 }}>
          {error}
        </p>
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

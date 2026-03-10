import type { FeedHealth } from "@/lib/types";

const feedHealthMap = new Map<string, FeedHealth>();

const updateFeedSuccess = (
  sourceId: string,
  sourceName: string,
  articleCount: number,
) => {
  const now = new Date().toISOString();
  const previous = feedHealthMap.get(sourceId);

  feedHealthMap.set(sourceId, {
    sourceId,
    sourceName,
    lastCheckedAt: now,
    lastSuccessAt: now,
    lastFailureAt: previous?.lastFailureAt,
    lastError: previous?.lastError,
    lastArticleCount: articleCount,
  });
};

const updateFeedFailure = (
  sourceId: string,
  sourceName: string,
  error: string,
) => {
  const now = new Date().toISOString();
  const previous = feedHealthMap.get(sourceId);

  feedHealthMap.set(sourceId, {
    sourceId,
    sourceName,
    lastCheckedAt: now,
    lastSuccessAt: previous?.lastSuccessAt,
    lastFailureAt: now,
    lastError: error,
    lastArticleCount: previous?.lastArticleCount,
  });
};

const getFeedHealth = (): FeedHealth[] => (
  Array.from(feedHealthMap.values()).sort((a, b) => (
    a.sourceName.localeCompare(b.sourceName)
  ))
);

export { updateFeedFailure, updateFeedSuccess, getFeedHealth };

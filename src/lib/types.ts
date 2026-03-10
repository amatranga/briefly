
type Article = {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  publishedAt?: string;
  description?: string;
  summary?: string;
};

type CacheStatus = "hit" | "miss" | null;

type ErrorType = { sourceId: string; sourceName: string; error: string };

type BookmarkItem = Pick<
  Article,
  "title" | "link" | "sourceName" | "publishedAt" | "summary" | "description"
> & {
  savedAt: string;
};

type ReadHistoryItem = Pick<
  Article,
  "title" | "link" | "sourceName" | "publishedAt"
> & {
  readAt: string
}

type BriefSnapshot = {
  id: string;
  generatedAt: string;
  topics: string[];
  limit: number;
  cache?: CacheStatus;
  errors?: Array<ErrorType>;
  items: Article[];
}

const TOPICS = [
  "business",
  "tech",
  "markets",
  "sports",
  "entertainment",
] as const;

type Topic = typeof TOPICS[number];

type RssSource = {
  id: string;
  name: string;
  url: string;
  topics: Topic[];
};

type TopicWeights = Record<Topic, number>;

const VIEWS = [ "brief", "bookmarks", "history", "briefs" ];
type View = (typeof VIEWS)[number];

type FeedHealth = {
  sourceId: string;
  sourceName: string;
  lastCheckedAt: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastError?: string;
  lastArticleCount?: number;
}

export type {
  Article,
  BookmarkItem,
  ReadHistoryItem,
  BriefSnapshot,
  CacheStatus,
  ErrorType,
  TopicWeights,
  Topic,
  RssSource,
  View,
  FeedHealth,
};

export { TOPICS, VIEWS };
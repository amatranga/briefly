
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

const VIEWS = [ "brief", "feed", "bookmarks", "history", "briefs" ];
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

type FeedbackValue = "up" | "down";

type UserPreferences = {
  topicAffinity: Record<Topic, number>;
  keywordAffinity: Record<string, number>;
  articleFeedback: Record<string, FeedbackValue>;
}

type ArticleSignalStrength = "weak" | "medium" | "strong" | "negative";

const KEYWORDS: Record<Topic, string[]> = {
  business: ["startup", "revenue", "merger", "acquisition", "earnings", "ceo", "layoff", "funding"],
  tech: ["ai", "software", "openai", "apple", "google", "microsoft", "security", "cloud", "saas"],
  markets: ["stocks", "s&p", "nasdaq", "dow", "inflation", "fed", "rates", "yield", "crypto"],
  sports: ["nba", "nfl", "mlb", "nhl", "score", "playoffs", "trade", "coach"],
  entertainment: ["movie", "tv", "netflix", "music", "album", "tour", "box office", "celebrity"],
};

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
  FeedbackValue,
  UserPreferences,
  ArticleSignalStrength,
};

export { TOPICS, VIEWS, KEYWORDS };
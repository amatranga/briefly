import type {
  Article,
  ArticleSignalStrength,
  FeedbackValue,
  UserPreferences,
  Topic,
} from "@/lib/types";
import { TOPICS, KEYWORDS } from "@/lib/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";
import { normalizeText } from "@/lib/helpers";

const DEFAULT_PREFERENCES: UserPreferences = {
  topicAffinity: {
    business: 0,
    tech: 0,
    markets: 0,
    sports: 0,
    entertainment: 0,
  },
  keywordAffinity: {},
  articleFeedback: {},
};

const SIGNAL_WEIGHTS: Record<ArticleSignalStrength, number> = {
  weak: 0.25,
  medium: 0.75,
  strong: 1.5,
  negative: -1.25,
};

const getUserPreferences = (): UserPreferences => (
  loadJSON<UserPreferences>(STORAGE_KEYS.userPreferences, DEFAULT_PREFERENCES)
);

const saveUserPreferences = (preferences: UserPreferences) => {
  saveJSON(STORAGE_KEYS.userPreferences, preferences);
};

const getMatchedTopics = (article: Article): Topic[] => {
  const text = normalizeText(`${article.title} ${article.description ?? ""}`);
  const matches: Topic[] = [];

  for (const topic of TOPICS) {
    const hasMatch = KEYWORDS[topic].some((kw) => text.includes(kw.toLowerCase()));
    if (hasMatch) matches.push(topic);
  }

  return matches;
};

const getMatchedKeywords = (article: Article): string[] => {
  const text = normalizeText(`${article.title} ${article.description ?? ""}`);
  const matched = new Set<string>();

  for (const topic of TOPICS) {
    for (const kw of KEYWORDS[topic]) {
      if (text.includes(kw.toLowerCase())) matched.add(kw);
    }
  }

  return Array.from(matched);
};

const applyArticleSignal = (
  article: Article,
  strength: ArticleSignalStrength,
): UserPreferences => {
  const preferences = getUserPreferences();
  const delta = SIGNAL_WEIGHTS[strength];

  const matchedTopics = getMatchedTopics(article);
  const matchedKeywords = getMatchedKeywords(article);

  for (const topic of matchedTopics) {
    preferences.topicAffinity[topic] += delta;
  }

  for (const kw of matchedKeywords) {
    preferences.keywordAffinity[kw] = (preferences.keywordAffinity[kw] ?? 0) + delta;
  }

  saveUserPreferences(preferences);
  return preferences;
};

const setArticleFeedback = (
  article: Article,
  value: FeedbackValue,
): UserPreferences => {
  const preferences = getUserPreferences();

  const previous = preferences.articleFeedback[article.link];
  if (previous === value) return preferences;

  preferences.articleFeedback[article.link] = value;

  const strength: ArticleSignalStrength = value === "up" ? "strong" : "negative";
  const updated = applyArticleSignal(article, strength);
  updated.articleFeedback[article.link] = value;

  saveUserPreferences(updated);
  return updated;
};

const clearArticleFeedback = (articleLink: string): UserPreferences => {
  const preferences = getUserPreferences();
  delete preferences.articleFeedback[articleLink];
  saveUserPreferences(preferences);
  return preferences;
};

const getArticleFeedback = (articleLink: string): FeedbackValue | undefined => {
  return getUserPreferences().articleFeedback[articleLink];
};

const resetUserPreferences = (): UserPreferences => {
  const reset: UserPreferences = {
    topicAffinity: {
      business: 0,
      tech: 0,
      markets: 0,
      sports: 0,
      entertainment: 0,
    },
    keywordAffinity: {},
    articleFeedback: {},
  };

  saveUserPreferences(reset);
  return reset;
}

export {
  getUserPreferences,
  saveUserPreferences,
  applyArticleSignal,
  setArticleFeedback,
  clearArticleFeedback,
  getArticleFeedback,
  resetUserPreferences,
};

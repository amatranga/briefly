import type { Topic, Article, TopicWeights, UserPreferences } from "@/lib/types";
import { KEYWORDS } from "@/lib/types";
import { normalizeText } from "@/lib/helpers";

const countOccurrences = (text: string, keyword: string): number => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  return (text.match(regex) ?? []).length;
};

const computeDocumentFrequency = (
  articles: Article[],
  selectedTopics: Topic[],
): Map<string, number> => {
  const df = new Map<string, number>();

  for (const topic of selectedTopics) {
    for (const keyword of KEYWORDS[topic]) {
      let count = 0;

      for (const article of articles) {
        const hay = normalizeText(`${article.title} ${article.description ?? ""}`);
        if (hay.includes(keyword.toLowerCase())) count += 1;
      }

      df.set(keyword, count);
    }
  }

  return df;
};

const scoreArticle = (
  article: Article,
  selectedTopics: Topic[],
  topicWeights: TopicWeights,
  documentFrequency: Map<string, number>,
  corpusSize: number,
  userPreferences: UserPreferences,
): number => {
  const title = normalizeText(article.title);
  const description = normalizeText(article.description ?? "");

  let score = 0;

  for (const topic of selectedTopics) {
    const topicWeight = topicWeights[topic] ?? 1;
    const learnedTopicBoost = userPreferences?.topicAffinity?.[topic] ?? 0;

    for (const keyword of KEYWORDS[topic]) {
      const titleHits = countOccurrences(title, keyword);
      const bodyHits = countOccurrences(description, keyword);

      if (titleHits === 0 && bodyHits === 0) continue;

      const df = documentFrequency.get(keyword) ?? 1;
      const idf = Math.log((corpusSize + 1) / (df + 1)) + 1;
      const keywordBoost = userPreferences?.keywordAffinity?.[keyword] ?? 0;

      score += titleHits * 3 * topicWeight * idf;
      score += bodyHits * 1 * topicWeight * idf;
      score += learnedTopicBoost;
      score += keywordBoost;
    }
  }

  const explicitFeedback = userPreferences?.articleFeedback?.[article.link];
  if (explicitFeedback === "up") score += 5;
  if (explicitFeedback === "down") score -= 5;

  return score;
}

const rankArticles = (
  articles: Article[],
  selectedTopics: Topic[],
  topicWeights: TopicWeights,
  userPreferences: UserPreferences,
): Article[] => {
  const corpusSize = articles.length || 1;
  const documentFrequency = computeDocumentFrequency(articles, selectedTopics);

  return [...articles].sort((a, b) => {
    const scoreA = scoreArticle(
      a,
      selectedTopics,
      topicWeights,
      documentFrequency,
      corpusSize,
      userPreferences,
    );

    const scoreB = scoreArticle(
      b,
      selectedTopics,
      topicWeights,
      documentFrequency,
      corpusSize,
      userPreferences,
    );

    if (scoreB !== scoreA) return scoreB - scoreA;

    const timeA = Date.parse(a.publishedAt ?? "") || 0;
    const timeB = Date.parse(b.publishedAt ?? "") || 0;

    return timeB - timeA;
  });
};

export { scoreArticle, rankArticles };

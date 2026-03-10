import type { Topic, Article, TopicWeights } from "@/lib/types";

const KEYWORDS: Record<Topic, string[]> = {
  business: ["startup", "revenue", "merger", "acquisition", "earnings", "ceo", "layoff", "funding"],
  tech: ["ai", "software", "openai", "apple", "google", "microsoft", "security", "cloud", "saas"],
  markets: ["stocks", "s&p", "nasdaq", "dow", "inflation", "fed", "rates", "yield", "crypto"],
  sports: ["nba", "nfl", "mlb", "nhl", "score", "playoffs", "trade", "coach"],
  entertainment: ["movie", "tv", "netflix", "music", "album", "tour", "box office", "celebrity"],
};

const normalizeText = (text: string): string => (
  text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()
);

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
): number => {
  const title = normalizeText(article.title);
  const description = normalizeText(article.description ?? "");

  let score = 0;

  for (const topic of selectedTopics) {
    const topicWeight = topicWeights[topic] ?? 1;

    for (const keyword of KEYWORDS[topic]) {
      const titleHits = countOccurrences(title, keyword);
      const bodyHits = countOccurrences(description, keyword);

      if (titleHits === 0 && bodyHits === 0) continue;

      const df = documentFrequency.get(keyword) ?? 1;
      const idf = Math.log((corpusSize + 1) / (df + 1)) + 1;

      score += titleHits * 3 * idf;
      score += bodyHits * 1 * topicWeight * idf;
    }
  }

  return score;
}

const rankArticles = (
  articles: Article[],
  selectedTopics: Topic[],
  topicWeights: TopicWeights,
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
    );

    const scoreB = scoreArticle(
      b,
      selectedTopics,
      topicWeights,
      documentFrequency,
      corpusSize,
    );

    if (scoreB !== scoreA) return scoreB - scoreA;

    const timeA = Date.parse(a.publishedAt ?? "") || 0;
    const timeB = Date.parse(b.publishedAt ?? "") || 0;

    return timeB - timeA;
  });
};

export { scoreArticle, rankArticles };

import type { Topic, Article, TopicWeights } from "@/lib/types";

const KEYWORDS: Record<Topic, string[]> = {
  business: ["startup", "revenue", "merger", "acquisition", "earnings", "ceo", "layoff", "funding"],
  tech: ["ai", "software", "openai", "apple", "google", "microsoft", "security", "cloud", "saas"],
  markets: ["stocks", "s&p", "nasdaq", "dow", "inflation", "fed", "rates", "yield", "crypto"],
  sports: ["nba", "nfl", "mlb", "nhl", "score", "playoffs", "trade", "coach"],
  entertainment: ["movie", "tv", "netflix", "music", "album", "tour", "box office", "celebrity"],
};

const countOccurancces = (text: string, keyword: string) : number => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  return (text.match(regex) ?? []).length;
}

const scoreArticle = (
  article: Article,
  selectedTopics: Topic[],
  topicWeights: TopicWeights,
): number => {
  const title = article.title.toLowerCase();
  const description = (article.description ?? "").toLowerCase();

  let score = 0;
  const titleWeight = 3;
  const descriptionWeight = 1;

  for (const topic of selectedTopics) {
    const weight = topicWeights[topic] ?? 1;

    for (const keyword of KEYWORDS[topic]) {
      const titleHits = countOccurancces(title, keyword);
      const descriptionHits = countOccurancces(description, keyword);

      score += titleHits * titleWeight * weight;
      score += descriptionHits * descriptionWeight * weight
    }
  }

  return score;
}

const rankArticles = (
  articles: Article[],
  selectedTopics: Topic[],
  topicWeights: TopicWeights, 
): Article[] => (
  [...articles].sort((a, b) => {
    const scoreA = scoreArticle(a, selectedTopics, topicWeights);
    const scoreB = scoreArticle(b, selectedTopics, topicWeights);

    if (scoreB !== scoreA) return scoreB - scoreA;

    const timeA = Date.parse(a.publishedAt ?? "") || 0;
    const timeB = Date.parse(b.publishedAt ?? "") || 0;

    return timeB - timeA;
  })
);

export { rankArticles };

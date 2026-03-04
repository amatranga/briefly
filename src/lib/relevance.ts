import type { Topic } from "@/lib/sources";

const KEYWORDS: Record<Topic, string[]> = {
  business: ["startup", "revenue", "merger", "acquisition", "earnings", "ceo", "layoff", "funding"],
  tech: ["ai", "software", "openai", "apple", "google", "microsoft", "security", "cloud", "saas"],
  markets: ["stocks", "s&p", "nasdaq", "dow", "inflation", "fed", "rates", "yield", "crypto"],
  sports: ["nba", "nfl", "mlb", "nhl", "score", "playoffs", "trade", "coach"],
  entertainment: ["movie", "tv", "netflix", "music", "album", "tour", "box office", "celebrity"],
};

const scoreArticle = (text: string, topics: Topic[]): number => {
  const hay = text.toLowerCase();
  let score = 0;

  for (const t of topics) {
    for (const kw of KEYWORDS[t]) {
      if (hay.includes(kw)) score += 1;
    }
  }
  return score;
}

export { scoreArticle };

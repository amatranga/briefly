import { Article } from "@/lib/types";

const normalizeTitle = (title: string) : string => (
  title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/|s+/g, " ")
    .trim()
);

const fingerprint = (article: Article): string => (
  normalizeTitle(article.title)
);

const dedupeArticles = (articles: Article[]): Article[] => {
  const seen = new Set<string>();
  const deduped: Article[] = [];

  for (const article of articles) {
    const key = fingerprint(article);

    if (seen.has(key)) continue;
    
    seen.add(key);
    deduped.push(article);
  }

  return deduped;
};

export { dedupeArticles };

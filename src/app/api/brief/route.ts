import { NextRequest, NextResponse } from "next/server";
import { BriefRequestSchema } from "@/lib/validate";
import { SOURCES } from "@/lib/sources";
import { fetchRssArticles } from "@/lib/rss";
import { summarizeFromDescription, summarizeWithAi } from "@/lib/sumarize";
import { MemoryCache } from "@/lib/cache";
import { Article } from "@/lib/types";

const rssCache = new MemoryCache<Article[]>();
const RSS_TTL_MS = 1000 * 60 * 10 // 10 minutes

async function mapWithConcurency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let i = 0;

  const worker = async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = BriefRequestSchema.parse(body);

    const topics = new Set(parsed.topics);
    const sources = SOURCES.filter(s => s.topics.some(t => topics.has(t)));

    const results = await Promise.allSettled(
      sources.map(async source => {
        const cacheKey = `rss:${source.id}`;
        const cached = rssCache.get(cacheKey);
        if (cached) return cached;

        const fresh = await fetchRssArticles(source.id, source.name, source.url);
        rssCache.set(cacheKey, fresh, RSS_TTL_MS);
        return fresh;
      })
    );

    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<any>).value);

    // rough sort by date if present (fallback is original order)
    articles.sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

    // const limited = articles.slice(0, parsed.limit).map(article => ({
    //   ...article,
    //   summary: summarizeFromDescription(article.description),
    // }));
    const limited = articles.slice(0, parsed.limit);

    const items = await mapWithConcurency(limited, 3, async (article) => {
      const baseText = article.description ?? article.title;
      const ai = await summarizeWithAi(baseText);
      return { ...article, summary: ai ?? summarizeFromDescription(article.description) };
    });

    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 400 },
    );
  };
};

export { POST };

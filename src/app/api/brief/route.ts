import { NextRequest, NextResponse } from "next/server";
import { BriefRequestSchema } from "@/lib/validate";
import { SOURCES } from "@/lib/sources";
import { fetchRssArticles } from "@/lib/rss";
import { summarizeFromDescription, summarizeWithAi } from "@/lib/summarize";
import { MemoryCache } from "@/lib/cache";
import { Article } from "@/lib/types";

const EXPIRY_MS = 1000 * 60 * 10; // 10 minutes
const rssCache = new MemoryCache<Article[]>();
const RSS_TTL_MS = EXPIRY_MS;
const briefCache = new MemoryCache<any>();
const BRIEF_TTL_MS = EXPIRY_MS;
const ENABLE_AI = process.env.ENABLE_AI_SUMMARIES === "true";

async function mapWithConcurrency<T, R>(
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

    const sortedTopics = [...parsed.topics].sort();
    const briefCacheKey = `brief:topics=${sortedTopics.join(",")}:limit=${parsed.limit}:ai=${ENABLE_AI}`;
    const cachedBriefEntry = briefCache.getEntry?.(briefCacheKey)

    if (cachedBriefEntry) {
      return NextResponse.json({
        ...cachedBriefEntry.value,
        lastUpdated: new Date(cachedBriefEntry.createdAt).toISOString(),
        cache: "hit",
      });
    }

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

    const errors: Array<{ sourceId: string, sourceName: string; error: string }> = [];

    const articles = results.flatMap((r, idx) => {
      const src = sources[idx];

      if (r.status === 'fulfilled') return r.value;

      errors.push({
        sourceId: src.id,
        sourceName: src.name,
        error: (r.reason?.message ?? String(r.reason)).slice(0, 200),
      });
      return [];
    });

    // rough sort by date if present (fallback is original order)
    articles.sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

    const limited = articles.slice(0, parsed.limit);

    const items = await mapWithConcurrency(limited, 3, async (article) => {
      const fallback = summarizeFromDescription(article.description);

      /**
       * AI summarization can be kind of slow due to how calls are being made (1 call per article)
       * This means calls are network-bound + model processing time (!)
       * 
       * At some point, it would be worth looking into either...
       *    1. 1 AI call to summarize all articles
       *    2. Summarize only top 1 - 2 items
       *    3. Streaming results
       * 
       * For now, we're skipping AI summaries though
       */
      
      if (!ENABLE_AI) {
        return { ...article, summary: fallback };
      }

      const baseText = article.description ?? article.title;
      const ai = await summarizeWithAi(baseText);
      return { ...article, summary: ai ?? fallback };
    });

    // If cache missed, cache response
    const payload = { items, errors };
    briefCache.set(briefCacheKey, payload, BRIEF_TTL_MS);

    return NextResponse.json({
      ...payload,
      lastUpdated: new Date().toISOString(),
      cache: "miss",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 400 },
    );
  };
};

export { POST };

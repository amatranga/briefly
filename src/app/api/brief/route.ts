import { NextRequest, NextResponse } from "next/server";
import { BriefRequestSchema } from "@/lib/validate";
import { DEFAULT_TOPIC_WEIGHTS, SOURCES } from "@/lib/sources";
import { fetchRssArticles } from "@/lib/rss";
import { summarizeFromDescription, summarizeWithAi } from "@/lib/summarize";
import { MemoryCache } from "@/lib/cache";
import { Article, ErrorType } from "@/lib/types";
import { rankArticles } from "@/lib/relevance";
import { dedupeArticles } from "@/lib/dedupe";

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const rssCache = new MemoryCache<Article[]>();
const briefCache = new MemoryCache<any>();
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
    
    if (!parsed.force) {
      const cachedBriefEntry = briefCache.getEntry?.(briefCacheKey);
      
      if (cachedBriefEntry) {
        return NextResponse.json({
          ...cachedBriefEntry.value,
          lastUpdated: new Date(cachedBriefEntry.createdAt).toISOString(),
          cache: "hit",
        });
      }
    }

    const topics = new Set(parsed.topics);
    const sources = SOURCES.filter(s => s.topics.some(t => topics.has(t)));

    const results = await Promise.allSettled(
      sources.map(async source => {
        const cacheKey = `rss:${source.id}`;
        const cached = rssCache.get(cacheKey);
        if (cached) return cached;

        const fresh = await fetchRssArticles(source.id, source.name, source.url);
        rssCache.set(cacheKey, fresh, CACHE_TTL_MS);
        return fresh;
      })
    );

    const errors: ErrorType[] = [];

    const fetchedArticles = results.flatMap((r, idx) => {
      const src = sources[idx];

      if (r.status === 'fulfilled') return r.value;

      errors.push({
        sourceId: src.id,
        sourceName: src.name,
        error: (r.reason?.message ?? String(r.reason)).slice(0, 200),
      });
      return [];
    });

    const articles = dedupeArticles(fetchedArticles);

    const weights = parsed.topicWeights ?? DEFAULT_TOPIC_WEIGHTS;

    const rankedArticles = rankArticles(
      articles,
      parsed.topics,
      weights,
    );

    const limited = rankedArticles.slice(0, parsed.limit);

    const items = await mapWithConcurrency(limited, 3, async (article) => {
      const fallback = summarizeFromDescription(article.description);

      // Note: AI summarization is slow (1 call per article)
      // Future optimizations: batch summarization, selective AI use, or streaming.
      
      if (!ENABLE_AI) {
        return { ...article, summary: fallback };
      }

      const baseText = article.description ?? article.title;
      const ai = await summarizeWithAi(baseText);
      return { ...article, summary: ai ?? fallback };
    });

    // If cache missed, cache response
    const payload = { items, errors };

    if (!parsed.force) {
      briefCache.set(briefCacheKey, payload, CACHE_TTL_MS);
    }

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
  }
};

export { POST };

import { NextRequest, NextResponse } from "next/server";
import { FeedRequestSchema } from "@/lib/validate";
import { summarizeFromDescription, summarizeWithAi } from "@/lib/summarize";
import { MemoryCache } from "@/lib/cache";
import { collectRankedArticles, CACHE_TTL_MS } from "@/lib/articlePipeline";
import { mapWithConcurrency, ENABLE_AI } from "@/app/api/helpers";

const feedCache = new MemoryCache<any>();

const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsed = FeedRequestSchema.parse(body);

    const sortedTopics = [...parsed.topics].sort();
    const feedCacheKey = `feed:topics=${sortedTopics.join(",")}:limit=${parsed.limit}:offset=${parsed.offset}:ai=${ENABLE_AI}`;

    const cachedFeedEntry = feedCache.getEntry?.(feedCacheKey);
    if (cachedFeedEntry) {
      return NextResponse.json({
        ...cachedFeedEntry.value,
        lastUpdated: new Date(cachedFeedEntry.createdAt).toISOString(),
        cache: "hit",
      });
    }

    const { articles: rankedArticles, errors } = await collectRankedArticles({
      topics: parsed.topics,
      topicWeights: parsed.topicWeights,
      userPreferences: parsed.userPreferences,
    });

    const paged = rankedArticles.slice(parsed.offset, parsed.offset + parsed.limit);

    const items = await mapWithConcurrency(paged, 3, async (article) => {
      const fallback = summarizeFromDescription(article.description);

      if (!ENABLE_AI) {
        return { ...article, summary: fallback };
      }

      const baseText = article.description ?? article.title;
      const ai = await summarizeWithAi(baseText);
      return { ...article, summary: ai ?? fallback };
    });

    const hasMore = parsed.offset + parsed.limit < rankedArticles.length;

    const payload = {
      items,
      errors,
      hasMore,
      nextOffset: parsed.offset + items.length,
    };

    feedCache.set(feedCacheKey, payload, CACHE_TTL_MS);

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

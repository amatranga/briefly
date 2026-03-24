import { DEFAULT_TOPIC_WEIGHTS, SOURCES } from "@/lib/sources";
import { fetchRssArticles } from "@/lib/rss";
import { MemoryCache } from "@/lib/cache";
import { Article, ErrorType, Topic, TopicWeights, UserPreferences } from "@/lib/types";
import { rankArticles } from "@/lib/relevance";
import { dedupeArticles } from "@/lib/dedupe";
import { updateFeedFailure, updateFeedSuccess } from "@/lib/feedHealth";

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

const rssCache = new MemoryCache<Article[]>();

type CollectRankedArticlesArgs = {
  topics: Topic[];
  topicWeights?: TopicWeights;
  userPreferences?: UserPreferences | null;
};

type CollectRankedArticlesResult = {
  articles: Article[];
  errors: ErrorType[];
};

const collectRankedArticles = async ({
  topics,
  topicWeights,
  userPreferences,
}: CollectRankedArticlesArgs): Promise<CollectRankedArticlesResult> => {
  const topicSet = new Set(topics);
  const sources = SOURCES.filter(source =>
    source.topics.some(topic => topicSet.has(topic))
  );

  const results = await Promise.allSettled(
    sources.map(async source => {
      const cacheKey = `rss:${source.id}`;
      const cached = rssCache.get(cacheKey);

      if (cached) {
        updateFeedSuccess(source.id, source.name, cached.length);
        return cached;
      }

      const fresh = await fetchRssArticles(source.id, source.name, source.url);
      rssCache.set(cacheKey, fresh, CACHE_TTL_MS);
      updateFeedSuccess(source.id, source.name, fresh.length);
      return fresh;
    })
  );

  const errors: ErrorType[] = [];

  const fetchedArticles = results.flatMap((result, idx) => {
    const source = sources[idx];

    if (result.status === "fulfilled") {
      return result.value;
    }

    const errMessage = (result.reason?.message ?? String(result.reason)).slice(0, 200);

    errors.push({
      sourceId: source.id,
      sourceName: source.name,
      error: errMessage,
    });

    updateFeedFailure(source.id, source.name, errMessage);
    return [];
  });

  const deduped = dedupeArticles(fetchedArticles);

  const weights = topicWeights ?? DEFAULT_TOPIC_WEIGHTS;

  const ranked = rankArticles(
    deduped,
    topics,
    weights,
    userPreferences ?? null
  );

  return {
    articles: ranked,
    errors,
  };
};

export { collectRankedArticles, CACHE_TTL_MS };

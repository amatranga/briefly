import { XMLParser } from "fast-xml-parser";
import type { Article } from "./types";

const parser = new XMLParser({ ignoreAttributes: false });

const fetchRssArticles = async (sourceId: string, sourceName: string, url: string): Promise<Article[]> => {
  const res = await fetch(url, { headers: {"User-Agent": "Briefly/1.0" } });
  if (!res.ok) throw new Error(`Failed RSS fetch: ${sourceName} (${res.status})`);

  const xml = await res.text();
  const data = parser.parse(xml);

  // Handle common RSS shape: rss.channel.item[]
  const items = data?.rss?.channel?.item ?? [];
  const normalized = (Array.isArray(items) ? items : [items]).map((item: any) => ({
    sourceId,
    sourceName,
    title: item?.title ?? "",
    link: item?.link ?? "",
    publishedAt: item?.pubDate ?? item?.published ?? undefined,
    description: item?.description ?? item?.summary ?? undefined,
  }));

  return normalized.filter(article => article.title && article.link);
}

export { fetchRssArticles };

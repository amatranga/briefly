import { NextRequest, NextResponse } from "next/server";
import { BriefRequestSchema } from "@/lib/validate";
import { SOURCES } from "@/lib/sources";
import { fetchRssArticles } from "@/lib/rss";
import { summarizeFromDescription } from "@/lib/sumarize";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BriefRequestSchema.parse(body);

    const topics = new Set(parsed.topics);
    const sources = SOURCES.filter(s => s.topics.some(t => topics.has(t)));

    const results = await Promise.allSettled(
      sources.map(s => fetchRssArticles(s.id, s.name, s.url))
    );

    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<any>).value);

    // rough sort by date if present (fallback is original order)
    articles.sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

    const limited = articles.slice(0, parsed.limit).map(article => ({
      ...article,
      summary: summarizeFromDescription(article.description),
    }));

    return NextResponse.json({ items: limited });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 400 },
    );
  };
};

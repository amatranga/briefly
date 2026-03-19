import { dedupeArticles } from "@/lib/dedupe";
import type { Article } from "@/lib/types";

describe("dedupeArticles", () => {
  it("removes duplicate articles with equivalent normalized titles", () => {
    const articles: Article[] = [
      {
        title: "Google launches AI tools!",
        link: "a",
        sourceName: "Source A",
        description: "desc",
        publishedAt: "2026-01-01",
        sourceId: "a",
      },
      {
        title: "Google launches AI tools",
        link: "b",
        sourceName: "Source B",
        description: "desc",
        publishedAt: "2026-01-02",
        sourceId: "b",
      },
    ];

    const result = dedupeArticles(articles);
    expect(result).toHaveLength(1);
    expect(result[0].link).toBe("a");
  });

  it ("keeps unique titles", () => {
    const articles: Article[] = [
      {
        title: "Google launches AI tools",
        link: "a",
        sourceName: "Source A",
        description: "desc",
        publishedAt: "2026-01-01",
        sourceId: "a",
      },
      {
        title: "Microsoft expands cloud offering",
        link: "b",
        sourceName: "Source B",
        description: "desc",
        publishedAt: "2026-01-02",
        sourceId: "b",
      },
    ];

    const result = dedupeArticles(articles);
    expect(result).toHaveLength(2);
  });
});

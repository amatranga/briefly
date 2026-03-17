import {
  getHistory,
  markAsRead,
  isRead,
  clearHistory,
} from "@/lib/history";
import type { Article } from "@/lib/types";

const article: Article = {
  title: "AI startup raises funding",
  link: "https://example.com/a",
  sourceName: "TechCrunch",
  description: "desc",
  summary: "summary",
  publishedAt: "2026-01-01",
  sourceId: "a",
};

describe("history", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(getHistory()).toEqual([]);
  });

  it("marks an article as read", () => {
    const result = markAsRead(article);

    expect(result).toHaveLength(1);
    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0].link).toBe(article.link);
  });

  it("reports read articles correctly", () => {
    expect(isRead(article.link)).toBe(false);

    markAsRead(article);

    expect(isRead(article.link)).toBe(true);
  });

  it("returns false for unread articles", () => {
    markAsRead(article);

    expect(isRead("https://example.com/other")).toBe(false);
  });

  it("does not duplicate history entries for the same article", () => {
    markAsRead(article);
    markAsRead(article);

    expect(getHistory()).toHaveLength(1);
  });

  it("preserves history metadata when marking as read", () => {
    markAsRead(article);

    const [saved] = getHistory();

    expect(saved.title).toBe(article.title);
    expect(saved.link).toBe(article.link);
    expect(saved.sourceName).toBe(article.sourceName);
    expect(saved.publishedAt).toBe(article.publishedAt);
    expect(saved.readAt).toBeDefined();
  });

  it("clears all history", () => {
    markAsRead(article);

    expect(getHistory()).toHaveLength(1);

    clearHistory();

    expect(getHistory()).toEqual([]);
    expect(isRead(article.link)).toBe(false);
  });

  it("clearHistory is safe to call when history is already empty", () => {
    expect(getHistory()).toEqual([]);

    clearHistory();

    expect(getHistory()).toEqual([]);
  });
});

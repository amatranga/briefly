import {
  getBookmarks,
  toggleBookmark,
  isBookmarked,
  removeBookmark,
} from "@/lib/bookmark";
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

describe("bookmarks", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(getBookmarks()).toEqual([]);
  });

  it("adds a bookmark", () => {
    const result = toggleBookmark(article);

    expect(result.action).toBe("added");
    expect(result.items).toHaveLength(1);
    expect(getBookmarks()).toHaveLength(1);
  });

  it("reports bookmarked articles correctly", () => {
    expect(isBookmarked(article.link)).toBe(false);

    toggleBookmark(article);

    expect(isBookmarked(article.link)).toBe(true);
  });

  it("returns false for links that are not bookmarked", () => {
    toggleBookmark(article);

    expect(isBookmarked("https://example.com/other")).toBe(false);
  });

  it("removes a bookmark on second toggle", () => {
    toggleBookmark(article);
    const result = toggleBookmark(article);

    expect(result.action).toBe("removed");
    expect(result.items).toHaveLength(0);
    expect(getBookmarks()).toHaveLength(0);
  });

  it("removes a bookmark by link", () => {
    toggleBookmark(article);

    const updated = removeBookmark(article.link);

    expect(updated).toHaveLength(0);
    expect(getBookmarks()).toHaveLength(0);
    expect(isBookmarked(article.link)).toBe(false);
  });

  it("does nothing when removeBookmark is called with an unknown link", () => {
    toggleBookmark(article);

    const before = getBookmarks();
    const updated = removeBookmark("https://example.com/missing");

    expect(updated).toEqual(before);
    expect(getBookmarks()).toEqual(before);
  });

  it("preserves bookmark metadata when added", () => {
    toggleBookmark(article);

    const [saved] = getBookmarks();

    expect(saved.title).toBe(article.title);
    expect(saved.link).toBe(article.link);
    expect(saved.sourceName).toBe(article.sourceName);
    expect(saved.summary).toBe(article.summary);
    expect(saved.description).toBe(article.description);
    expect(saved.publishedAt).toBe(article.publishedAt);
    expect(saved.savedAt).toBeDefined();
  });
});

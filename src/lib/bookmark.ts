import type { Article, BookmarkItem } from "@/lib/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";

const getBookmarks = (): BookmarkItem[] => (
  loadJSON<BookmarkItem[]>(STORAGE_KEYS.bookmarks, [])
);

const isBookmarked = (link: string): boolean => (
  getBookmarks().some(bookmark => bookmark.link === link)
);

const toggleBookmark = (article: Article): BookmarkItem[] => {
  const current = getBookmarks();
  const exists = current.some(bookmark => bookmark.link === article.link);

  const next = exists
    ? current.filter(bookmark => bookmark.link !== article.link)
    : [
      {
        title: article.title,
        link: article.link,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        summary: article.summary,
        description: article.description,
        savedAt: new Date().toISOString(),
      },
      ...current,
    ];

  saveJSON(STORAGE_KEYS.bookmarks, next);
  return next;
};

const removeBookmark = (link: string): BookmarkItem[] => {
  const next = getBookmarks().filter(bookmark => bookmark.link !== link);
  saveJSON(STORAGE_KEYS.bookmarks, next);
  return next;
};

export { getBookmarks, isBookmarked, toggleBookmark, removeBookmark };

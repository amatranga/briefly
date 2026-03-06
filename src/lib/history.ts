import type { Article, ReadHistoryItem } from "@/lib/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";

const HISTORY_LIMIT = 500;

const getHistory = (): ReadHistoryItem[] => (
  loadJSON<ReadHistoryItem[]>(STORAGE_KEYS.history, [])
);

const isRead = (link: string): boolean => (
  getHistory().some(historyItem => historyItem.link === link)
);

const markAsRead = (article: Article): ReadHistoryItem[] => {
  const current = getHistory();
  if (current.some(historyItem => historyItem.link === article.link)) return current;

  const next: ReadHistoryItem[] = [
    {
      title: article.title,
      link: article.link,
      sourceName: article.sourceName,
      publishedAt: article.publishedAt,
      readAt: new Date().toISOString(),
    },
    ...current,
  ].slice(0, HISTORY_LIMIT);

  saveJSON(STORAGE_KEYS.history, next);
  return next;
};

const clearHistory = (): void => {
  saveJSON(STORAGE_KEYS.history, []);
};

export { getHistory, isRead, markAsRead, clearHistory };

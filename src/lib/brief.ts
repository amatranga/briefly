import type { Article, BriefSnapshot, CacheStatus, ErrorType } from "@/lib/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "@/lib/storage";

const BRIEF_LIMIT = 20;

const makeId = (): string => (
  globalThis.crypto?.randomUUID?.() ?? `brief_${Date.now()}_${Math.random().toString(16).slice(2)}`
);

const getBriefs = (): BriefSnapshot[] => (
  loadJSON<BriefSnapshot[]>(STORAGE_KEYS.briefs, [])
);

const saveBriefSnapshot = (
  input: {
    topics: string[];
    limit: number;
    items: Article[];
    cache?: CacheStatus;
    errors?: ErrorType[];
  }
): BriefSnapshot[] => {
  const current = getBriefs();
  const next: BriefSnapshot[] = [
    {
      id: makeId(),
      generatedAt: new Date().toISOString(),
      topics: input.topics,
      limit: input.limit,
      cache: input.cache ?? null,
      errors: input.errors?? [],
      items: input.items,
    },
    ...current,
  ].slice(0, BRIEF_LIMIT);

  saveJSON(STORAGE_KEYS.briefs, next);
  return next;
};

const removeBrief = (id: string): BriefSnapshot[] => {
  const next = getBriefs().filter((brief => brief.id !== id));
  saveJSON(STORAGE_KEYS.briefs, next);
  return next;
};

const clearBriefs = (): void => {
  saveJSON(STORAGE_KEYS.briefs, []);
};

export { getBriefs, saveBriefSnapshot, removeBrief, clearBriefs };

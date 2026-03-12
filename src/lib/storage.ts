const STORAGE_KEYS = {
  bookmarks: "briefly:v1:bookmarks",
  history: "briefly:v1:history",
  briefs: "briefly:v1:briefs",
  userPreferences: "briefly:v1:userPreferences",
} as const;

const loadJSON = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const saveJSON = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export { STORAGE_KEYS, loadJSON, saveJSON };

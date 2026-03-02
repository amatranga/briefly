type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  createdAt: number;
};

export class MemoryCache<T> {
  private store = new Map<string, CacheEntry<T>>();

  getEntry(key: string): CacheEntry<T> | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry;
  }

  get(key: string): T | null {
    return this.getEntry(key)?.value ?? null;
  }

  set(key: string, value: T, ttlMs: number) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }
};

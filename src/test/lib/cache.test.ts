import { MemoryCache } from "@/lib/cache";

describe("MemoryCache", () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null for missing keys", () => {
    const cache = new MemoryCache<number>();

    expect(cache.get("missing")).toBeNull();
    expect(cache.getEntry("missing")).toBeNull();
  });

  it("stores and retrieves values", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 42, 1000);

    expect(cache.get("a")).toBe(42);

    const entry = cache.getEntry("a");

    expect(entry).not.toBeNull();
    expect(entry?.value).toBe(42);
    expect(entry?.expiresAt).toBeGreaterThan(entry!.createdAt);
  });

  it("returns null after expiration", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 42, 1000);

    jest.advanceTimersByTime(2000);

    expect(cache.get("a")).toBeNull();
  });

  it("removes expired entries from the store", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 42, 1000);

    jest.advanceTimersByTime(2000);

    expect(cache.getEntry("a")).toBeNull();

    // internal cleanup verified indirectly
    expect(cache.get("a")).toBeNull();
  });

  it("getEntry returns full cache metadata", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 10, 1000);

    const entry = cache.getEntry("a");

    expect(entry).toMatchObject({
      value: 10,
      createdAt: expect.any(Number),
      expiresAt: expect.any(Number),
    });
  });

  it("set overwrites an existing key", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 1, 1000);
    cache.set("a", 2, 1000);

    expect(cache.get("a")).toBe(2);
  });

  it("handles ttl of zero (immediate expiration)", () => {
    const cache = new MemoryCache<number>();

    cache.set("a", 1, 0);

    expect(cache.get("a")).toBeNull();
  });
});

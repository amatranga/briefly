import {
  updateFeedFailure,
  updateFeedSuccess,
  getFeedHealth,
  clearFeedHealth,
} from "@/lib/feedHealth";

describe("feedHealth", () => {
  beforeEach(() => {
    clearFeedHealth();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts empty", () => {
    expect(getFeedHealth()).toEqual([]);
  });

  it("records a successful feed update", () => {
    updateFeedSuccess("techcrunch", "TechCrunch", 12);

    const result = getFeedHealth();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sourceId: "techcrunch",
      sourceName: "TechCrunch",
      lastCheckedAt: "2026-01-01T12:00:00.000Z",
      lastSuccessAt: "2026-01-01T12:00:00.000Z",
      lastFailureAt: undefined,
      lastError: undefined,
      lastArticleCount: 12,
    });
  });

  it("records a failed feed update", () => {
    updateFeedFailure("espn", "ESPN", "Request timed out");

    const result = getFeedHealth();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sourceId: "espn",
      sourceName: "ESPN",
      lastCheckedAt: "2026-01-01T12:00:00.000Z",
      lastSuccessAt: undefined,
      lastFailureAt: "2026-01-01T12:00:00.000Z",
      lastError: "Request timed out",
      lastArticleCount: undefined,
    });
  });

  it("preserves prior failure information when a later success occurs", () => {
    updateFeedFailure("techcrunch", "TechCrunch", "Initial failure");

    jest.setSystemTime(new Date("2026-01-01T12:05:00.000Z"));
    updateFeedSuccess("techcrunch", "TechCrunch", 8);

    const result = getFeedHealth()[0];

    expect(result.sourceId).toBe("techcrunch");
    expect(result.lastCheckedAt).toBe("2026-01-01T12:05:00.000Z");
    expect(result.lastSuccessAt).toBe("2026-01-01T12:05:00.000Z");
    expect(result.lastFailureAt).toBe("2026-01-01T12:00:00.000Z");
    expect(result.lastError).toBe("Initial failure");
    expect(result.lastArticleCount).toBe(8);
  });

  it("preserves prior success information when a later failure occurs", () => {
    updateFeedSuccess("bbc", "BBC", 15);

    jest.setSystemTime(new Date("2026-01-01T12:10:00.000Z"));
    updateFeedFailure("bbc", "BBC", "Feed returned 500");

    const result = getFeedHealth()[0];

    expect(result.sourceId).toBe("bbc");
    expect(result.lastCheckedAt).toBe("2026-01-01T12:10:00.000Z");
    expect(result.lastSuccessAt).toBe("2026-01-01T12:00:00.000Z");
    expect(result.lastFailureAt).toBe("2026-01-01T12:10:00.000Z");
    expect(result.lastError).toBe("Feed returned 500");
    expect(result.lastArticleCount).toBe(15);
  });

  it("sorts feed health entries by source name", () => {
    updateFeedSuccess("z-source", "Zeta News", 2);
    updateFeedSuccess("a-source", "Alpha News", 5);
    updateFeedSuccess("m-source", "Morning Brew", 3);

    const result = getFeedHealth();

    expect(result.map((feed) => feed.sourceName)).toEqual([
      "Alpha News",
      "Morning Brew",
      "Zeta News",
    ]);
  });

  it("updates an existing feed record rather than duplicating it", () => {
    updateFeedSuccess("techcrunch", "TechCrunch", 5);

    jest.setSystemTime(new Date("2026-01-01T12:01:00.000Z"));
    updateFeedSuccess("techcrunch", "TechCrunch", 10);

    const result = getFeedHealth();

    expect(result).toHaveLength(1);
    expect(result[0].lastArticleCount).toBe(10);
    expect(result[0].lastSuccessAt).toBe("2026-01-01T12:01:00.000Z");
  });
});

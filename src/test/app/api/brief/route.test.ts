import type { Article } from "@/lib/types";

type MockRequest = {
  json: jest.Mock<Promise<unknown>, []>;
};

type JsonResult = {
  body: any;
  status: number;
};

type HarnessOptions = {
  enableAi?: boolean;
  fetchRssArticles?: jest.Mock;
  summarizeWithAi?: jest.Mock;
  summarizeFromDescription?: jest.Mock;
};

type Harness = {
  POST: (req: MockRequest) => Promise<JsonResult>;
  mocks: {
    jsonMock: jest.Mock;
    fetchRssArticles: jest.Mock;
    rankArticles: jest.Mock;
    dedupeArticles: jest.Mock;
    summarizeFromDescription: jest.Mock;
    summarizeWithAi: jest.Mock;
    updateFeedSuccess: jest.Mock;
    updateFeedFailure: jest.Mock;
  };
};

const makeRequest = (body: unknown): MockRequest => ({
  json: jest.fn().mockResolvedValue(body),
});

const makeValidBody = (
  overrides: Partial<{ topics: string[]; limit: number; force: boolean }> = {},
) => ({
  topics: ["tech"],
  limit: 5,
  force: false,
  ...overrides,
});

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  sourceId: "techcrunch",
  sourceName: "TechCrunch",
  title: "AI startup raises funding",
  link: "https://example.com/a",
  publishedAt: "2026-01-01",
  description: "AI cloud startup funding round",
  ...overrides,
});

const identityArticles = (articles: Article[]) => articles;

const loadRouteHarness = async (options: HarnessOptions = {}): Promise<Harness> => {
  jest.resetModules();
  jest.clearAllMocks();

  if (options.enableAi) {
    process.env.ENABLE_AI_SUMMARIES = "true";
  } else {
    delete process.env.ENABLE_AI_SUMMARIES;
  }

  const jsonMock = jest.fn((body: unknown, init?: { status?: number }) => ({
    body,
    status: init?.status ?? 200,
  }));

  const fetchRssArticles =
    options.fetchRssArticles ?? jest.fn().mockResolvedValue([makeArticle()]);
  const rankArticles = jest.fn(identityArticles);
  const dedupeArticles = jest.fn(identityArticles);
  const summarizeFromDescription =
    options.summarizeFromDescription ?? jest.fn().mockReturnValue("Fallback summary");
  const summarizeWithAi = options.summarizeWithAi ?? jest.fn().mockResolvedValue(null);
  const updateFeedSuccess = jest.fn();
  const updateFeedFailure = jest.fn();

  jest.doMock("next/server", () => ({
    NextResponse: { json: jsonMock },
  }));

  jest.doMock("@/lib/rss", () => ({
    fetchRssArticles,
  }));

  jest.doMock("@/lib/relevance", () => ({
    rankArticles,
  }));

  jest.doMock("@/lib/dedupe", () => ({
    dedupeArticles,
  }));

  jest.doMock("@/lib/summarize", () => ({
    summarizeFromDescription,
    summarizeWithAi,
  }));

  jest.doMock("@/lib/feedHealth", () => ({
    updateFeedSuccess,
    updateFeedFailure,
  }));

  const { POST } = require("@/app/api/brief/route");

  return {
    POST,
    mocks: {
      jsonMock,
      fetchRssArticles,
      rankArticles,
      dedupeArticles,
      summarizeFromDescription,
      summarizeWithAi,
      updateFeedSuccess,
      updateFeedFailure,
    },
  };
};

describe("POST /api/brief", () => {
  beforeEach(() => {
    delete process.env.ENABLE_AI_SUMMARIES;
  });

  it("returns 400 for an invalid request body", async () => {
    const { POST } = await loadRouteHarness();
    const req = makeRequest({ topics: [] }); // invalid: missing valid limit / empty topics
    const result = await POST(req);

    expect(result.status).toBe(400);
    expect(result.body.error).toBeDefined();
  });

  describe("successful responses", () => {
    it("returns summarized items and cache miss on first valid request", async () => {
      const { POST, mocks } = await loadRouteHarness();

      const result = await POST(makeRequest(makeValidBody()));

      expect(result.status).toBe(200);
      expect(result.body.cache).toBe("miss");
      expect(result.body.items).toHaveLength(1);
      expect(result.body.items[0].summary).toBe("Fallback summary");
      expect(result.body.errors).toEqual([]);

      expect(mocks.fetchRssArticles).toHaveBeenCalled();
      expect(mocks.rankArticles).toHaveBeenCalled();
      expect(mocks.dedupeArticles).toHaveBeenCalled();
      expect(mocks.updateFeedSuccess).toHaveBeenCalled();
      expect(mocks.updateFeedFailure).not.toHaveBeenCalled();
    });

    it("returns partial success and captures feed errors", async () => {
      const goodArticle = makeArticle({ link: "https://example.com/good" });
      const fetchRssArticles = jest.fn().mockImplementation((sourceId: string) => {
        if (sourceId === "techcrunch") return Promise.resolve([goodArticle]);
        return Promise.reject(new Error("Feed exploded"));
      });

      const { POST, mocks } = await loadRouteHarness({ fetchRssArticles });

      const result = await POST(
        makeRequest(makeValidBody({ topics: ["tech", "business"] })),
      );

      expect(result.status).toBe(200);
      expect(result.body.items.length).toBeGreaterThanOrEqual(1);
      expect(result.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(mocks.updateFeedFailure).toHaveBeenCalled();
    });
  });

  describe("cache behavior", () => {
    it("returns cache hit on repeated identical request", async () => {
      const { POST, mocks } = await loadRouteHarness();

      const first = await POST(makeRequest(makeValidBody()));
      const second = await POST(makeRequest(makeValidBody()));

      expect(first.body.cache).toBe("miss");
      expect(second.body.cache).toBe("hit");
      expect(mocks.fetchRssArticles).toHaveBeenCalledTimes(1);
    });

    it("bypasses brief cache when force is true", async () => {
      const { POST, mocks } = await loadRouteHarness();

      const first = await POST(makeRequest(makeValidBody({ force: false })));
      const second = await POST(makeRequest(makeValidBody({ force: true })));

      expect(first.body.cache).toBe("miss");
      expect(second.body.cache).toBe("miss");
      expect(mocks.fetchRssArticles).toHaveBeenCalledTimes(1);
      expect(mocks.rankArticles).toHaveBeenCalledTimes(2);
    });
  });

  describe("AI summaries", () => {
    it.each([
      {
        name: "uses AI summaries when enabled and available",
        aiResult: "AI summary",
        expectedSummary: "AI summary",
        expectAiCalled: true,
      },
      {
        name: "falls back to description summary when AI returns null",
        aiResult: null,
        expectedSummary: "Fallback summary",
        expectAiCalled: true,
      },
    ])("$name", async ({ aiResult, expectedSummary, expectAiCalled }) => {
      const summarizeWithAi = jest.fn().mockResolvedValue(aiResult);

      const { POST, mocks } = await loadRouteHarness({
        enableAi: true,
        summarizeWithAi,
      });

      const result = await POST(makeRequest(makeValidBody()));

      expect(result.body.items[0].summary).toBe(expectedSummary);
      if (expectAiCalled) {
        expect(mocks.summarizeWithAi).toHaveBeenCalled();
      }
    });
  });
});

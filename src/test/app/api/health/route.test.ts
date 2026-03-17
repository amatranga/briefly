type HealthFeed = {
  sourceId: string;
  sourceName: string;
  lastCheckedAt: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  lastError?: string;
  lastArticleCount?: number;
};

type HealthResult = {
  body: any;
  status: number;
};

type HealthHarness = {
  GET: () => Promise<HealthResult>;
  mocks: {
    jsonMock: jest.Mock;
    getFeedHealth: jest.Mock;
  };
};

type HealthHarnessOptions = {
  feeds?: HealthFeed[];
  openAiApiKey?: string;
  enableAiSummaries?: string;
};

const mockFeeds: HealthFeed[] = [
  {
    sourceId: "techcrunch",
    sourceName: "TechCrunch",
    lastCheckedAt: "2026-01-01T00:00:00.000Z",
    lastSuccessAt: "2026-01-01T00:00:00.000Z",
    lastFailureAt: undefined,
    lastError: undefined,
    lastArticleCount: 10,
  },
];

const originalEnv = process.env;

const loadHealthHarness = async (
  options: HealthHarnessOptions = {},
): Promise<HealthHarness> => {
  jest.resetModules();
  jest.clearAllMocks();

  process.env = { ...originalEnv };

  if (options.openAiApiKey !== undefined) {
    process.env.OPENAI_API_KEY = options.openAiApiKey;
  } else {
    delete process.env.OPENAI_API_KEY;
  }

  if (options.enableAiSummaries !== undefined) {
    process.env.ENABLE_AI_SUMMARIES = options.enableAiSummaries;
  } else {
    delete process.env.ENABLE_AI_SUMMARIES;
  }

  const jsonMock = jest.fn((body: unknown) => ({ body, status: 200 }));
  const getFeedHealth = jest.fn(() => options.feeds ?? []);

  jest.doMock("next/server", () => ({
    NextResponse: { json: jsonMock },
  }));

  jest.doMock("@/lib/feedHealth", () => ({
    getFeedHealth,
  }));

  const { GET } = require("@/app/api/health/route");

  return {
    GET,
    mocks: {
      jsonMock,
      getFeedHealth,
    },
  };
};

describe("GET /api/health", () => {
  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns health status with feeds", async () => {
    const { GET } = await loadHealthHarness({ feeds: mockFeeds });

    const result = await GET();

    expect(result.status).toBe(200);
    expect(result.body.status).toBe("ok");
    expect(result.body.feeds).toEqual(mockFeeds);
    expect(result.body.checkedAt).toBeDefined();
    expect(typeof result.body.checkedAt).toBe("string");
  });

  it.each([
    {
      name: "detects when OpenAI API key is configured",
      options: { openAiApiKey: "test-key" },
      expected: true,
    },
    {
      name: "detects when OpenAI API key is missing",
      options: {},
      expected: false,
    },
  ])("$name", async ({ options, expected }) => {
    const { GET } = await loadHealthHarness(options);
    const result = await GET();
    expect(result.body.openaiConfigured).toBe(expected);
  });

  it("reports whether AI summaries are enabled", async () => {
    const { GET } = await loadHealthHarness({ enableAiSummaries: "true" });
    const result = await GET();
    expect(result.body.openAiEnabled).toBe("true");
  });

  it("calls getFeedHealth to populate feed status", async () => {
    const { GET, mocks } = await loadHealthHarness({ feeds: mockFeeds });
    await GET();
    expect(mocks.getFeedHealth).toHaveBeenCalledTimes(1);
  });
});

import { fetchRssArticles } from "@/lib/rss";

const FEED_URL = "https://example.com/feed.xml";
const mockFetch = jest.fn();

const mockFetchXml = (xml: string, ok = true, status = 200) => {
  mockFetch.mockResolvedValue({
    ok,
    status,
    text: async () => xml,
  } as Response);
};

const fetchFromTestFeed = (
  sourceId: string,
  sourceName: string,
) => fetchRssArticles(sourceId, sourceName, FEED_URL);

describe("fetchRssArticles", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockFetch.mockReset();
    Object.defineProperty(global, "fetch", {
      writable: true,
      configurable: true,
      value: mockFetch,
    });
  });

  it("fetches and parses RSS articles", async () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <title>AI startup raises funding</title>
            <link>https://example.com/a</link>
            <pubDate>2026-01-01</pubDate>
            <description>OpenAI cloud software funding round</description>
          </item>
          <item>
            <title>Markets rally on inflation news</title>
            <link>https://example.com/b</link>
            <pubDate>2026-01-02</pubDate>
            <description>Fed and inflation updates</description>
          </item>
        </channel>
      </rss>
    `;

    mockFetchXml(xml);

    const result = await fetchFromTestFeed("reuters", "Reuters");

    expect(global.fetch).toHaveBeenCalledWith(
      FEED_URL,
      { headers: { "User-Agent": "Briefly/1.0" } },
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      sourceId: "reuters",
      sourceName: "Reuters",
      title: "AI startup raises funding",
      link: "https://example.com/a",
      publishedAt: "2026-01-01",
      description: "OpenAI cloud software funding round",
    });
  });

  it("throws when fetch response is not ok", async () => {
    mockFetchXml("", false, 500);

    await expect(
      fetchFromTestFeed("espn", "ESPN"),
    ).rejects.toThrow("Failed RSS fetch: ESPN (500)");
  });

  it("filters out items missing title or link", async () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <title>Valid article</title>
            <link>https://example.com/a</link>
            <description>desc</description>
          </item>
          <item>
            <title></title>
            <link>https://example.com/b</link>
            <description>missing title</description>
          </item>
          <item>
            <title>Missing link</title>
            <link></link>
            <description>missing link</description>
          </item>
        </channel>
      </rss>
    `;

    mockFetchXml(xml);

    const result = await fetchFromTestFeed("source", "Source");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Valid article");
  });

  it("handles a single RSS item object instead of an array", async () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <title>Single item</title>
            <link>https://example.com/single</link>
            <pubDate>2026-01-03</pubDate>
            <description>Only one item in feed</description>
          </item>
        </channel>
      </rss>
    `;

    mockFetchXml(xml);

    const result = await fetchFromTestFeed("single", "Single Source");

    expect(result).toHaveLength(1);
    expect(result[0].link).toBe("https://example.com/single");
  });

  it.each([
    {
      name: "falls back to summary when description is missing",
      xml: `
        <rss>
          <channel>
            <item>
              <title>Summary fallback article</title>
              <link>https://example.com/summary</link>
              <pubDate>2026-01-04</pubDate>
              <summary>Summary text here</summary>
            </item>
          </channel>
        </rss>
      `,
      sourceId: "summary-source",
      sourceName: "Summary Source",
      assert: (result: Awaited<ReturnType<typeof fetchRssArticles>>) => {
        expect(result).toHaveLength(1);
        expect(result[0].description).toBe("Summary text here");
      },
    },
    {
      name: "falls back to published when pubDate is missing",
      xml: `
        <rss>
          <channel>
            <item>
              <title>Published fallback article</title>
              <link>https://example.com/published</link>
              <published>2026-01-05</published>
              <description>Published fallback</description>
            </item>
          </channel>
        </rss>
      `,
      sourceId: "published-source",
      sourceName: "Published Source",
      assert: (result: Awaited<ReturnType<typeof fetchRssArticles>>) => {
        expect(result).toHaveLength(1);
        expect(result[0].publishedAt).toBe("2026-01-05");
      },
    },
  ])("$name", async ({ xml, sourceId, sourceName, assert }) => {
    mockFetchXml(xml);
    const result = await fetchFromTestFeed(sourceId, sourceName);
    assert(result);
  });

  it("returns an empty array when the feed has no items", async () => {
    const xml = `
      <rss>
        <channel></channel>
      </rss>
    `;

    mockFetchXml(xml);

    const result = await fetchFromTestFeed("empty", "Empty Feed");

    expect(result).toEqual([]);
  });

  it("cleans HTML and entities in title and description", async () => {
    const xml = `
      <rss>
        <channel>
          <item>
            <title>Google &#8216;AI&#8217; tools</title>
            <link>https://example.com/clean</link>
            <description><![CDATA[<p>Hello <strong>world</strong></p>]]></description>
          </item>
        </channel>
      </rss>
    `;

    mockFetchXml(xml);

    const result = await fetchFromTestFeed("clean", "Clean Feed");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Google ‘AI’ tools");
    expect(result[0].description).toBe("Hello world");
  });
});
import { scoreArticle, rankArticles } from "@/lib/relevance";
import type { Article, Topic, TopicWeights, UserPreferences } from "@/lib/types";

const baseWeights: TopicWeights = {
  business: 1,
  tech: 1,
  markets: 1,
  sports: 1,
  entertainment: 1,
};

const basePreferences: UserPreferences = {
  topicAffinity: {
    business: 0,
    tech: 0,
    markets: 0,
    sports: 0,
    entertainment: 0,
  },
  keywordAffinity: {},
  articleFeedback: {},
};

const corpusSize = 2;
const techTopic: Topic[] = ["tech"];

let articleSeed = 0;
const makeArticle = (overrides: Partial<Article>): Article => ({
  title: "",
  description: "",
  link: `article-${articleSeed++}`,
  sourceName: "Test Source",
  publishedAt: "2026-01-01",
  sourceId: "Test source id",
  ...overrides,
});

type ScoreInput = {
  article: Partial<Article>;
  topics?: Topic[];
  weights?: TopicWeights;
  df?: Map<string, number>;
  preferences?: UserPreferences;
};

const scoreFor = ({
  article,
  topics = techTopic,
  weights = baseWeights,
  df = new Map<string, number>([["ai", 1]]),
  preferences = basePreferences,
}: ScoreInput): number => {
  return scoreArticle(
    makeArticle(article),
    topics,
    weights,
    df,
    corpusSize,
    preferences,
  );
};

describe("scoreArticle", () => {
  it("scores articles with matching keywords", () => {
    const score = scoreFor({
      article: {
        title: "AI startup launches product",
        description: "",
        link: "a",
      },
    });

    expect(score).toBeGreaterThan(0);
  });

  it("weights title matches higher than description matches", () => {
    const titleScore = scoreFor({
      article: { title: "AI innovation", description: "", link: "a" },
    });
    const descScore = scoreFor({
      article: { title: "", description: "AI innovation", link: "b" },
    });

    expect(titleScore).toBeGreaterThan(descScore);
  });

  describe("preference and weighting boosts", () => {
    const article = { title: "AI software platform", link: "boosted" };

    it.each([
      {
        name: "applies topic weights",
        boosted: {
          weights: { ...baseWeights, tech: 5 },
        },
      },
      {
        name: "applies learned topic affinity",
        boosted: {
          preferences: {
            ...basePreferences,
            topicAffinity: { ...basePreferences.topicAffinity, tech: 2 },
          },
        },
      },
      {
        name: "applies keyword affinity",
        boosted: {
          preferences: {
            ...basePreferences,
            keywordAffinity: { ai: 3 },
          },
        },
      },
    ])("$name", ({ boosted }) => {
      const boostedScore = scoreFor({ article, ...boosted });
      const normalScore = scoreFor({ article });
      expect(boostedScore).toBeGreaterThan(normalScore);
    });
  });

  it("applies explicit positive feedback", () => {
    const preferences: UserPreferences = {
      ...basePreferences,
      articleFeedback: {
        a: "up",
      },
    };

    const score = scoreFor({
      article: { title: "AI startup news", link: "a" },
      preferences,
    });

    expect(score).toBeGreaterThan(4);
  });

  it("applies explicit negative feedback", () => {
    const preferences: UserPreferences = {
      ...basePreferences,
      articleFeedback: {
        a: "down",
      },
    };

    const score = scoreFor({
      article: { title: "AI startup news", link: "a" },
      preferences,
    });

    expect(score).toBeLessThan(0);
  });

  it.each([
    {
      name: "returns 0 when no keywords match",
      input: {
        article: {
          title: "Random article about gardening",
          description: "plants and soil",
        },
        df: new Map<string, number>(),
      },
      assert: (score: number) => expect(score).toBe(0),
    },
    {
      name: "handles an article with undefined description",
      input: {
        article: {
          title: "AI startup launch",
          description: undefined,
          link: "undefined-desc",
        },
      },
      assert: (score: number) => expect(score).toBeGreaterThan(0),
    },
    {
      name: "uses fallback idf when document frequency does not contain a keyword",
      input: {
        article: { title: "AI platform launch", link: "missing-df" },
        df: new Map<string, number>(),
      },
      assert: (score: number) => expect(score).toBeGreaterThan(0),
    },
    {
      name: "uses fallback topic weight of 1 when a topic weight is missing",
      input: {
        article: { title: "AI platform launch", link: "missing-weight" },
        weights: {
          business: 1,
          markets: 1,
          sports: 1,
          entertainment: 1,
        } as TopicWeights,
      },
      assert: (score: number) => expect(score).toBeGreaterThan(0),
    },
    {
      name: "handles missing user preference values by falling back to 0",
      input: {
        article: { title: "AI software platform", link: "missing-pref-values" },
        preferences: {
          topicAffinity: {} as UserPreferences["topicAffinity"],
          keywordAffinity: {},
          articleFeedback: {},
        } as UserPreferences,
      },
      assert: (score: number) => expect(score).toBeGreaterThan(0),
    },
  ])("$name", ({ input, assert }) => {
    assert(scoreFor(input));
  });

  it("counts repeated keyword occurrences", () => {
    const score = scoreFor({
      article: {
        title: "AI AI AI",
        description: "AI software",
        link: "repeated-keywords",
      },
      df: new Map([
        ["ai", 1],
        ["software", 1],
      ]),
    });

    expect(score).toBeGreaterThan(10);
  });
});

describe("rankArticles", () => {
  const rank = (
    articles: Article[],
    preferences: UserPreferences = basePreferences,
  ) => rankArticles(articles, techTopic, baseWeights, preferences);

  it("orders articles by score", () => {
    const articles: Article[] = [
      makeArticle({ title: "AI startup raises funding", link: "a" }),
      makeArticle({ title: "Baseball team signs coach", link: "b" }),
    ];

    const ranked = rank(articles);
    expect(ranked[0].link).toBe("a");
  });

  it("uses recency as a tiebreaker", () => {
    const articles: Article[] = [
      makeArticle({ title: "Tech article", link: "a", publishedAt: "2026-01-01" }),
      makeArticle({ title: "Tech article", link: "b", publishedAt: "2026-01-02" }),
    ];

    const ranked = rank(articles);
    expect(ranked[0].link).toBe("b");
  });

  it("returns an empty array when no articles are provided", () => {
    expect(rank([])).toEqual([]);
  });

  it("prefers score difference over recency when scores are not tied", () => {
    const articles: Article[] = [
      makeArticle({
        title: "General update",
        description: "",
        link: "older-but-relevant",
        publishedAt: "2026-01-01",
      }),
      makeArticle({
        title: "AI software cloud startup",
        description: "",
        link: "newer-and-more-relevant",
        publishedAt: "2026-01-01",
      }),
    ];

    const ranked = rank(articles);
    expect(ranked[0].link).toBe("newer-and-more-relevant");
  });

  it("respects explicit feedback when ranking articles", () => {
    const articles: Article[] = [
      makeArticle({ title: "AI startup article", link: "a" }),
      makeArticle({ title: "AI startup article two", link: "b" }),
    ];

    const preferences: UserPreferences = {
      ...basePreferences,
      articleFeedback: { b: "up" },
    };

    const ranked = rank(articles, preferences);
    expect(ranked[0].link).toBe("b");
  });
});

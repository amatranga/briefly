import {
  getUserPreferences,
  saveUserPreferences,
  applyArticleSignal,
  setArticleFeedback,
  clearArticleFeedback,
  getArticleFeedback,
  resetUserPreferences,
} from "@/lib/preferences";
import { Article, UserPreferences, KEYWORDS } from "@/lib/types";

const techArticle: Article = {
  title: "AI startup raises funding",
  link: "https://example.com/tech",
  sourceName: "TechCrunch",
  description: "OpenAI cloud software startup funding",
  summary: "summary",
  publishedAt: "2026-01-01",
  sourceId: "a",
};

const sportsArticle: Article = {
  title: "NBA coach discusses playoff trade",
  link: "https://example.com/sports",
  sourceName: "ESPN",
  description: "NBA playoffs and trade rumors",
  summary: "summary",
  publishedAt: "2026-01-02",
  sourceId: "b",
};

describe("preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default preferences when storage is empty", () => {
    const prefs = getUserPreferences();

    expect(prefs).toEqual({
      topicAffinity: {
        business: 0,
        tech: 0,
        markets: 0,
        sports: 0,
        entertainment: 0,
      },
      keywordAffinity: {},
      articleFeedback: {},
    });
  });

  it("persists preferences with saveUserPreferences", () => {
    const custom: UserPreferences = {
      topicAffinity: {
        business: 1,
        tech: 2,
        markets: -1,
        sports: 0,
        entertainment: 0.5,
      },
      keywordAffinity: {
        ai: 3,
        nba: -2,
      },
      articleFeedback: {
        "https://example.com/tech": "up",
      },
    };

    saveUserPreferences(custom);

    expect(getUserPreferences()).toEqual(custom);
  });

  it("applies a weak positive signal to matched topic and keywords", () => {
    const prefs = applyArticleSignal(techArticle, "weak");

    expect(prefs.topicAffinity.tech).toBeGreaterThan(0);
    expect(prefs.topicAffinity.business).toBeGreaterThan(0);

    expect(prefs.keywordAffinity.ai).toBeGreaterThan(0);
    expect(prefs.keywordAffinity.startup).toBeGreaterThan(0);
    expect(prefs.keywordAffinity.funding).toBeGreaterThan(0);
  });

  it("applies a negative signal to matched topic and keywords", () => {
    const prefs = applyArticleSignal(techArticle, "negative");

    expect(prefs.topicAffinity.tech).toBeLessThan(0);
    expect(prefs.topicAffinity.business).toBeLessThan(0);

    expect(prefs.keywordAffinity.ai).toBeLessThan(0);
    expect(prefs.keywordAffinity.startup).toBeLessThan(0);
  });

  it("accumulates signals over time", () => {
    applyArticleSignal(techArticle, "weak");
    const afterSecond = applyArticleSignal(techArticle, "medium");

    expect(afterSecond.topicAffinity.tech).toBeGreaterThan(0.25);
    expect(afterSecond.keywordAffinity.ai).toBeGreaterThan(0.25);
  });

  it("only affects matched topics and keywords", () => {
    const prefs = applyArticleSignal(sportsArticle, "weak");

    expect(prefs.topicAffinity.sports).toBeGreaterThan(0);

    expect(prefs.topicAffinity.tech).toBe(0);
    expect(prefs.topicAffinity.business).toBeGreaterThan(0);
    expect(prefs.topicAffinity.markets).toBe(0);
    expect(prefs.topicAffinity.entertainment).toBe(0);
  });

  it("handles articles without a description", () => {
    const article = {
      title: "AI startup raises funding",
      link: "https://example.com/no-desc",
      sourceName: "TechCrunch",
      publishedAt: "2026-01-01",
      sourceId: "x",
    };

    const preferences = applyArticleSignal(article, "weak");

    expect(preferences.topicAffinity.tech).toBeGreaterThanOrEqual(0);
  });

  it("records explicit positive feedback", () => {
    const prefs = setArticleFeedback(techArticle, "up");

    expect(prefs.articleFeedback[techArticle.link]).toBe("up");
    expect(getArticleFeedback(techArticle.link)).toBe("up");
    expect(prefs.topicAffinity.tech).toBeGreaterThan(0);
  });

  it("records explicit negative feedback", () => {
    const prefs = setArticleFeedback(techArticle, "down");

    expect(prefs.articleFeedback[techArticle.link]).toBe("down");
    expect(getArticleFeedback(techArticle.link)).toBe("down");
    expect(prefs.topicAffinity.tech).toBeLessThan(0);
  });

  it("does not double-apply the same feedback value", () => {
    const first = setArticleFeedback(techArticle, "up");
    const second = setArticleFeedback(techArticle, "up");

    expect(second).toEqual(first);
    expect(second.topicAffinity.tech).toBe(first.topicAffinity.tech);
    expect(second.keywordAffinity.ai).toBe(first.keywordAffinity.ai);
  });

  it("changing feedback from up to down applies the new signal", () => {
    const up = setArticleFeedback(techArticle, "up");
    const down = setArticleFeedback(techArticle, "down");

    expect(up.articleFeedback[techArticle.link]).toBe("up");
    expect(down.articleFeedback[techArticle.link]).toBe("down");

    expect(down.topicAffinity.tech).toBeLessThan(up.topicAffinity.tech);
  });

  it("clears article feedback without removing learned affinities", () => {
    setArticleFeedback(techArticle, "up");
    const beforeClear = getUserPreferences();

    const afterClear = clearArticleFeedback(techArticle.link);

    expect(afterClear.articleFeedback[techArticle.link]).toBeUndefined();
    expect(getArticleFeedback(techArticle.link)).toBeUndefined();

    // learned affinities remain intact
    expect(afterClear.topicAffinity.tech).toBe(beforeClear.topicAffinity.tech);
    expect(afterClear.keywordAffinity.ai).toBe(beforeClear.keywordAffinity.ai);
  });

  it("getArticleFeedback returns undefined when no feedback exists", () => {
    expect(getArticleFeedback("https://example.com/missing")).toBeUndefined();
  });

  it("resetUserPreferences clears topic affinity, keyword affinity, and feedback", () => {
    setArticleFeedback(techArticle, "up");
    applyArticleSignal(sportsArticle, "medium");

    const reset = resetUserPreferences();

    expect(reset).toEqual({
      topicAffinity: {
        business: 0,
        tech: 0,
        markets: 0,
        sports: 0,
        entertainment: 0,
      },
      keywordAffinity: {},
      articleFeedback: {},
    });

    expect(getUserPreferences()).toEqual(reset);
  });
});

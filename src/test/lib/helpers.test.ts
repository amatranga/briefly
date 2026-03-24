import {
  normalizeWhitespace,
  normalizeText,
  cleanText,
  parseTopics,
  parseLimit,
  dedupeArticlesByLink,
} from "@/lib/helpers";
import { TOPICS } from "@/lib/types";
import type { Article, Topic } from "@/lib/types";

describe("helpers", () => {
  describe("normalizeWhitespace", () => {
    it("collapses consecutive spaces into a single space", () => {
      expect(normalizeWhitespace("hello     world")).toBe("hello world");
    });

    it("replaces line breaks and tabs with single spaces", () => {
      expect(normalizeWhitespace("hello\n\tworld \n today")).toBe("hello world today");
    });

    it("trims leading and trailing whitespace", () => {
      expect(normalizeWhitespace("   hello world   ")).toBe("hello world");
    });

    it("returns an empty string when given only whitespace", () => {
      expect(normalizeWhitespace("   \n\t   ")).toBe("");
    });
  });

  describe("normalizeText", () => {
    it("lowercases text", () => {
      expect(normalizeText("Hello World")).toBe("hello world");
    });

    it("removes punctuation and special characters", () => {
      expect(normalizeText("AI-powered Startup!")).toBe("ai powered startup");
    });

    it("normalizes whitespace after punctuation removal", () => {
      expect(normalizeText("Hello,,,   world!!!")).toBe("hello world");
    });

    it("preserves word characters and numbers", () => {
      expect(normalizeText("GPT-4 beats 3.5")).toBe("gpt 4 beats 3 5");
    });
  });

  describe("cleanText", () => {
    it("decodes HTML entities", () => {
      expect(cleanText("Tom &amp; Jerry")).toBe("Tom & Jerry");
    });

    it("removes HTML tags", () => {
      expect(cleanText("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    });

    it("decodes entities and removes tags together", () => {
      expect(cleanText("Google &ldquo;AI tools&rdquo; <p>launch</p>")).toBe(
        'Google “AI tools” launch'
      );
    });

    it("normalizes whitespace after cleaning", () => {
      expect(cleanText("<div>Hello</div>\n\n<span>world</span>")).toBe("Hello world");
    });
  });

  describe("parseTopics", () => {
    it("returns default topics when param is null", () => {
      expect(parseTopics(null)).toEqual(["business"]);
    });

    it("returns default topics when param is an empty string", () => {
      expect(parseTopics("")).toEqual(["business"]);
    });

    it("returns only allowed topics", () => {
      const first = TOPICS[0];
      const second = TOPICS[1];

      expect(parseTopics(`${first},invalid,${second}`)).toEqual([first, second]);
    });

    it("trims whitespace around topics", () => {
      const first = TOPICS[0];
      const second = TOPICS[1];

      expect(parseTopics(` ${first},   ${second} `)).toEqual([first, second]);
    });

    it("returns default topics when no valid topics are present", () => {
      expect(parseTopics("invalid,nope,bad")).toEqual(["business"]);
    });

    it("preserves duplicates if they are present in the param", () => {
      const first = TOPICS[0];
      expect(parseTopics(`${first},${first}`)).toEqual([first, first]);
    });
  });

  describe("parseLimit", () => {
    it("returns the parsed number when it is between 1 and 10", () => {
      expect(parseLimit("1")).toBe(1);
      expect(parseLimit("5")).toBe(5);
      expect(parseLimit("10")).toBe(10);
    });

    it("returns the default limit when param is null", () => {
      expect(parseLimit(null)).toBe(5);
    });

    it("returns the default limit when param is not a number", () => {
      expect(parseLimit("abc")).toBe(5);
    });

    it("returns the default limit when param is less than 1", () => {
      expect(parseLimit("0")).toBe(5);
      expect(parseLimit("-1")).toBe(5);
    });

    it("returns the default limit when param is greater than 10", () => {
      expect(parseLimit("11")).toBe(5);
    });

    it("returns the default limit when param is Infinity", () => {
      expect(parseLimit("Infinity")).toBe(5);
    });
  });

  describe("dedupeArticlesByLink", () => {
    const article1: Article = {
      title: "Article One",
      link: "https://example.com/1",
      sourceName: "Source A",
      description: "Description one",
    } as Article;

    const article1Duplicate: Article = {
      title: "Article One Duplicate",
      link: "https://example.com/1",
      sourceName: "Source B",
      description: "Duplicate description",
    } as Article;

    const article2: Article = {
      title: "Article Two",
      link: "https://example.com/2",
      sourceName: "Source C",
      description: "Description two",
    } as Article;

    it("returns an empty array when given no articles", () => {
      expect(dedupeArticlesByLink([])).toEqual([]);
    });

    it("returns the same array when all links are unique", () => {
      expect(dedupeArticlesByLink([article1, article2])).toEqual([article1, article2]);
    });

    it("removes duplicate articles by link", () => {
      expect(dedupeArticlesByLink([article1, article1Duplicate, article2])).toEqual([
        article1,
        article2,
      ]);
    });

    it("keeps the first article when duplicate links are found", () => {
      const result = dedupeArticlesByLink([article1, article1Duplicate]);
      expect(result).toEqual([article1]);
    });
  });
});

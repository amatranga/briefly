import { cleanText, normalizeText, normalizeWhitespace } from "@/lib/helpers";

describe("normalizeWhiteSpace", () => {
  it("collapses repeated spaces and trims", () => {
    expect(normalizeWhitespace("  hello  world  ")).toBe("hello world");
  });

  it("collapses newlines and tabs", () => {
    expect(normalizeWhitespace("hello\n\nworld\t\tagain")).toBe("hello world again");
  });
});

describe("normalizeText", () => {
  it ("lowercases, removes punctuation, and normalizes whitespace", () => {
    expect(normalizeText("AI-powered Startup!")).toBe("ai powered startup");
  });

  it("handles mixed punctuation cleanly", () => {
    expect(normalizeText("Hello, world... Nice!")).toBe("hello world nice");
  });
});

describe("cleanText", () => {
  it("decodes html entities", () => {
    expect(cleanText("Google &#8216;AI&#8217; tools")).toBe("Google ‘AI’ tools");
  });

  it("removes html tags", () => {
    expect(cleanText("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });

  it("normalizes whitespace after cleaning", () => {
    expect(cleanText("<p>Hello</p>\n\n<p>world</p>")).toBe("Hello world");
  });
});

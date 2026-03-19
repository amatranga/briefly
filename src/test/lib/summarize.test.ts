import OpenAI from "openai";
import {
  summarizeFromDescription,
  summarizeWithAi,
} from "@/lib/summarize";

jest.mock("openai", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe("summarizeFromDescription", () => {
  it("returns fallback text when description is missing", () => {
    expect(summarizeFromDescription()).toBe("No summary available.");
  });

  it("returns cleaned text when description is short", () => {
    const result = summarizeFromDescription("<p>Hello &#8216;world&#8217;</p>");
    expect(result).toBe("Hello ‘world’");
  });

  it("truncates long descriptions to 240 characters with ellipsis", () => {
    const longText = "a".repeat(300);

    const result = summarizeFromDescription(longText);

    expect(result).toHaveLength(240);
    expect(result.endsWith("...")).toBe(true);
    expect(result).toBe("a".repeat(237) + "...");
  });
});

describe("summarizeWithAi", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns null when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await summarizeWithAi("Some article text");

    expect(result).toBeNull();
    expect(OpenAI).not.toHaveBeenCalled();
  });

  it("returns null when cleaned input is empty", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const mockCreate = jest.fn();
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await summarizeWithAi("<p>   </p>");

    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("calls OpenAI and returns trimmed summary text", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-test";

    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: "  Clean summary text.  ",
          },
        },
      ],
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await summarizeWithAi("<p>Hello &#8216;world&#8217;</p>");

    expect(OpenAI).toHaveBeenCalledWith({ apiKey: "test-key" });
    expect(mockCreate).toHaveBeenCalledWith({
      model: "gpt-test",
      messages: [
        {
          role: "system",
          content:
            "You summarize news items into 1 - 2 concise sentences. No hype, no emojis, preserve factual tone.",
        },
        {
          role: "user",
          content: "Hello ‘world’",
        },
      ],
      temperature: 0.2,
    });
    expect(result).toBe("Clean summary text.");
  });

  it("returns null when OpenAI response content is missing", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-test";

    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: undefined,
          },
        },
      ],
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await summarizeWithAi("AI startup raises funding");

    expect(result).toBeNull();
  });

  it("returns null when OpenAI response content is an empty string after trimming", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "gpt-test";

    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: "   ",
          },
        },
      ],
    });

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));

    const result = await summarizeWithAi("AI startup raises funding");

    expect(result).toBeNull();
  });
});

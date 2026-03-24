import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { loadJSON, saveJSON } from "@/lib/storage";
import { saveBriefSnapshot } from "@/lib/brief";
import { getUserPreferences, resetUserPreferences } from "@/lib/preferences";
import { DEFAULT_TOPIC_WEIGHTS } from "@/lib/sources";
import { parseTopics, parseLimit, dedupeArticlesByLink } from "@/lib/helpers";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/lib/storage", () => ({
  loadJSON: jest.fn(),
  saveJSON: jest.fn(),
}));

jest.mock("@/lib/brief", () => ({
  saveBriefSnapshot: jest.fn(),
}));

jest.mock("@/lib/preferences", () => ({
  getUserPreferences: jest.fn(),
  resetUserPreferences: jest.fn(),
}));

jest.mock("@/lib/helpers", () => ({
  parseTopics: jest.fn(),
  parseLimit: jest.fn(),
  dedupeArticlesByLink: jest.fn(),
}));

jest.mock("@/lib/sources", () => ({
  DEFAULT_TOPIC_WEIGHTS: {
    business: 1,
    technology: 2,
    sports: 3,
  },
}));

jest.mock("@/components/Header", () => ({
  Header: ({
    theme,
    onToggleTheme,
  }: {
    theme: "light" | "dark";
    onToggleTheme: () => void;
  }) => (
    <div>
      <div data-testid="header-theme">{theme}</div>
      <button onClick={onToggleTheme}>mock toggle theme</button>
    </div>
  ),
}));

jest.mock("@/components/ViewSelector", () => ({
  ViewSelector: ({
    view,
    onChange,
  }: {
    view: string;
    onChange: (view: any) => void;
  }) => (
    <div>
      <div data-testid="current-view">{view}</div>
      <button onClick={() => onChange("brief")}>view brief</button>
      <button onClick={() => onChange("feed")}>view feed</button>
      <button onClick={() => onChange("bookmarks")}>view bookmarks</button>
      <button onClick={() => onChange("history")}>view history</button>
      <button onClick={() => onChange("briefs")}>view briefs</button>
    </div>
  ),
}));

jest.mock("@/components/TopicSelector", () => ({
  TopicSelector: ({
    value,
    onChange,
  }: {
    value: string[];
    onChange: (topics: any[]) => void;
  }) => (
    <div>
      <div data-testid="topics-value">{value.join(",")}</div>
      <button onClick={() => onChange(["technology"])}>set topics technology</button>
      <button onClick={() => onChange(["sports", "business"])}>set topics sports,business</button>
    </div>
  ),
}));

jest.mock("@/components/SettingsPanel", () => ({
  SettingsPanel: ({
    showSettings,
    onToggle,
    topics,
    topicWeights,
    onTopicWeightsChange,
    userPreferences,
    onResetPersonalization,
  }: {
    showSettings: boolean;
    onToggle: () => void;
    topics: string[];
    topicWeights: Record<string, number>;
    onTopicWeightsChange: (weights: Record<string, number>) => void;
    userPreferences: any;
    onResetPersonalization: () => void;
  }) => (
    <div>
      <div data-testid="settings-visible">{String(showSettings)}</div>
      <div data-testid="settings-topics">{topics.join(",")}</div>
      <div data-testid="settings-weights">{JSON.stringify(topicWeights)}</div>
      <div data-testid="settings-user-preferences">
        {userPreferences ? "present" : "null"}
      </div>
      <button onClick={onToggle}>toggle settings</button>
      <button onClick={() => onTopicWeightsChange({ ...topicWeights, business: 99 })}>
        change topic weights
      </button>
      <button onClick={onResetPersonalization}>reset personalization</button>
    </div>
  ),
}));

jest.mock("@/components/BriefView", () => ({
  BriefView: ({
    topicsCount,
    articles,
    loading,
    error,
    lastUpdated,
    cache,
    onGenerate,
    onRegenerate,
  }: {
    topicsCount: number;
    articles: any[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
    cache: string | null;
    onGenerate: () => void;
    onRegenerate: () => void;
  }) => (
    <div>
      <div data-testid="brief-topics-count">{String(topicsCount)}</div>
      <div data-testid="brief-articles-count">{String(articles.length)}</div>
      <div data-testid="brief-loading">{String(loading)}</div>
      <div data-testid="brief-error">{error ?? ""}</div>
      <div data-testid="brief-last-updated">{lastUpdated ?? ""}</div>
      <div data-testid="brief-cache">{cache ?? ""}</div>
      <button onClick={onGenerate}>generate brief</button>
      <button onClick={onRegenerate}>regenerate brief</button>
    </div>
  ),
}));

jest.mock("@/components/FeedView", () => ({
  FeedView: ({
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    onLoadMore,
    onRetry,
  }: {
    articles: any[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onLoadMore: () => void;
    onRetry: () => void;
  }) => (
    <div>
      <div data-testid="feed-articles-count">{String(articles.length)}</div>
      <div data-testid="feed-loading">{String(loading)}</div>
      <div data-testid="feed-loading-more">{String(loadingMore)}</div>
      <div data-testid="feed-error">{error ?? ""}</div>
      <div data-testid="feed-has-more">{String(hasMore)}</div>
      <button onClick={onLoadMore}>load more feed</button>
      <button onClick={onRetry}>retry feed</button>
    </div>
  ),
}));

jest.mock("@/components/BookmarksView", () => ({
  BookmarksView: () => <div>mock bookmarks view</div>,
}));

jest.mock("@/components/HistoryView", () => ({
  HistoryView: () => <div>mock history view</div>,
}));

jest.mock("@/components/BriefLogView", () => ({
  BriefLogView: ({
    onLoadBrief,
  }: {
    onLoadBrief: (snapshot: any) => void;
  }) => (
    <div>
      <div>mock brief log view</div>
      <button
        onClick={() =>
          onLoadBrief({
            items: [{ link: "https://example.com/from-log" }],
            generatedAt: "2026-03-17T12:00:00.000Z",
            cache: "fresh",
            limit: 7,
          })
        }
      >
        load saved brief
      </button>
    </div>
  ),
}));

describe("HomePage", () => {
  const replace = jest.fn();
  const mockSearchParamsGet = jest.fn();

  const mockUserPreferences = {
    topicAffinity: {
      business: 0.25,
      technology: -0.5,
      sports: 0,
    },
  };

  const defaultBriefResponse = {
    ok: true,
    json: async () => ({
      items: [{ link: "https://example.com/brief-1" }],
      lastUpdated: "2026-03-17T18:00:00.000Z",
      cache: "fresh",
      errors: [],
    }),
  };

  const defaultFeedResponse = {
    ok: true,
    json: async () => ({
      items: [{ link: "https://example.com/feed-1" }],
      hasMore: true,
      nextOffset: 1,
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({ replace });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockSearchParamsGet,
    });

    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "topics") return null;
      if (key === "limit") return null;
      return null;
    });

    (parseTopics as jest.Mock).mockImplementation((value: string | null) => {
      if (!value) return ["business"];
      return value.split(",");
    });

    (parseLimit as jest.Mock).mockImplementation((value: string | null) => {
      if (!value) return 5;
      return Number(value);
    });

    (dedupeArticlesByLink as jest.Mock).mockImplementation((items: any[]) => items);

    (loadJSON as jest.Mock).mockImplementation((key: string) => {
      if (key === "briefly:theme") return null;
      if (key === "briefly:topics") return null;
      if (key === "briefly:limit") return null;
      if (key === "briefly:topicWeights") return null;
      return null;
    });

    (getUserPreferences as jest.Mock).mockReturnValue(mockUserPreferences);
    (resetUserPreferences as jest.Mock).mockReturnValue({
      topicAffinity: {
        business: 0,
        technology: 0,
        sports: 0,
      },
    });

    Object.defineProperty(window, "fetch", {
      writable: true,
      value: jest.fn((url: string) => {
        if (url === "/api/brief") return Promise.resolve(defaultBriefResponse);
        if (url === "/api/feed") return Promise.resolve(defaultFeedResponse);
        return Promise.reject(new Error(`Unexpected url: ${url}`));
      }),
    });

    document.documentElement.dataset.theme = "";
  });

  it("renders with default brief view and default topics when URL/storage are empty", async () => {
    render(<HomePage />);

    expect(screen.getByTestId("current-view")).toHaveTextContent("brief");
    expect(screen.getByTestId("topics-value")).toHaveTextContent("business");
    expect(screen.getByText("generate brief")).toBeInTheDocument();

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        "/api/brief",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("initializes topics and limit from URL params", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "topics") return "tech,sports,invalid";
      if (key === "limit") return "7";
      return null;
    });

    render(<HomePage />);

    expect(screen.getByTestId("topics-value")).toHaveTextContent("tech,sports,invalid");
    expect(screen.getByTestId("brief-topics-count")).toHaveTextContent("3");
  });

  it("loads theme, topics, limit, weights, and user preferences from storage when URL params are absent", async () => {
    (loadJSON as jest.Mock).mockImplementation((key: string) => {
      if (key === "briefly:theme") return "light";
      if (key === "briefly:topics") return "tech,sports";
      if (key === "briefly:limit") return "6";
      if (key === "briefly:topicWeights") return { business: 10, technology: 11, sports: 12 };
      return null;
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("header-theme")).toHaveTextContent("light");
    });

    expect(screen.getByTestId("topics-value")).toHaveTextContent("tech,sports");
    expect(screen.getByTestId("settings-weights")).toHaveTextContent(
      JSON.stringify({ business: 10, technology: 11, sports: 12 })
    );
    expect(screen.getByTestId("settings-user-preferences")).toHaveTextContent("present");
  });

  it("toggles theme and persists it", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "mock toggle theme" }));

    await waitFor(() => {
      expect(screen.getByTestId("header-theme")).toHaveTextContent("light");
    });

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(saveJSON).toHaveBeenCalledWith("briefly:theme", "light");
  });

  it("persists topics and limit and updates the URL when topics change", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "set topics sports,business" }));

    await waitFor(() => {
      expect(screen.getByTestId("topics-value")).toHaveTextContent("sports,business");
    });

    expect(saveJSON).toHaveBeenCalledWith("briefly:topics", "sports,business");
    expect(replace).toHaveBeenLastCalledWith("/?topics=business%2Csports&limit=5");
  });

  it("switches to feed view", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view feed" }));

    expect(screen.getByTestId("feed-articles-count")).toBeInTheDocument();
  });

  it("switches to bookmarks view", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view bookmarks" }));

    expect(screen.getByText("mock bookmarks view")).toBeInTheDocument();
  });

  it("switches to history view", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view history" }));

    expect(screen.getByText("mock history view")).toBeInTheDocument();
  });

  it("switches to briefs view", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view briefs" }));

    expect(screen.getByText("mock brief log view")).toBeInTheDocument();
  });

  it("reloads user preferences when settings are opened", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "toggle settings" }));

    await waitFor(() => {
      expect(getUserPreferences).toHaveBeenCalled();
    });

    expect((getUserPreferences as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("updates topic weights and persists them", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "change topic weights" }));

    await waitFor(() => {
      expect(screen.getByTestId("settings-weights")).toHaveTextContent(
        JSON.stringify({ ...DEFAULT_TOPIC_WEIGHTS, business: 99 })
      );
    });

    expect(saveJSON).toHaveBeenCalledWith("briefly:topicWeights", {
      ...DEFAULT_TOPIC_WEIGHTS,
      business: 99,
    });
  });

  it("resets personalization from the settings panel", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "reset personalization" }));

    await waitFor(() => {
      expect(screen.getByTestId("settings-user-preferences")).toHaveTextContent("present");
    });

    expect(resetUserPreferences).toHaveBeenCalledTimes(1);
  });

  it("auto-generates the brief and loads the feed on mount", async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalledWith(
        "/api/brief",
        expect.objectContaining({ method: "POST" })
      );
      expect(window.fetch).toHaveBeenCalledWith(
        "/api/feed",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(screen.getByTestId("brief-articles-count")).toHaveTextContent("1");
  });

  it("generates a brief successfully", async () => {
    (window.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/feed") return Promise.resolve(defaultFeedResponse);
      if (url === "/api/brief") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [
              { link: "https://example.com/1" },
              { link: "https://example.com/2" },
            ],
            lastUpdated: "2026-03-17T18:00:00.000Z",
            cache: "fresh",
            errors: [{ source: "A", message: "oops" }],
          }),
        });
      }
      return Promise.reject(new Error("Unexpected url"));
    });

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "generate brief" }));

    await waitFor(() => {
      expect(screen.getByTestId("brief-articles-count")).toHaveTextContent("2");
    });

    const briefCall = (window.fetch as jest.Mock).mock.calls.find(
      ([url, init]: [string, RequestInit]) =>
        url === "/api/brief" &&
        JSON.parse(String(init.body)).force === false
    );

    expect(briefCall).toBeTruthy();
    expect(JSON.parse(String(briefCall[1].body))).toEqual({
      topics: ["business"],
      limit: 5,
      force: false,
      topicWeights: DEFAULT_TOPIC_WEIGHTS,
      userPreferences: mockUserPreferences,
    });

    expect(screen.getByTestId("brief-last-updated")).toHaveTextContent("2026-03-17T18:00:00.000Z");
    expect(screen.getByTestId("brief-cache")).toHaveTextContent("fresh");

    expect(saveBriefSnapshot).toHaveBeenCalledWith({
      topics: ["business"],
      limit: 5,
      items: [
        { link: "https://example.com/1" },
        { link: "https://example.com/2" },
      ],
      cache: "fresh",
      errors: [{ source: "A", message: "oops" }],
    });
  });

  it("regenerates a brief with force=true", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "regenerate brief" }));

    await waitFor(() => {
      const matchingCall = (window.fetch as jest.Mock).mock.calls.find(
        ([url, init]: [string, RequestInit]) =>
          url === "/api/brief" &&
          JSON.parse(String(init.body)).force === true
      );

      expect(matchingCall).toBeTruthy();
    });
  });

  it("shows an error when brief generation fails with a response error", async () => {
    (window.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/feed") return Promise.resolve(defaultFeedResponse);
      if (url === "/api/brief") {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            error: "Server exploded",
          }),
        });
      }
      return Promise.reject(new Error("Unexpected url"));
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("brief-error")).toHaveTextContent("Server exploded");
    });
  });

  it("shows a fallback error when brief generation throws without a message", async () => {
    (window.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "/api/feed") return Promise.resolve(defaultFeedResponse);
      if (url === "/api/brief") return Promise.reject({});
      return Promise.reject(new Error("Unexpected url"));
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("brief-error")).toHaveTextContent("Something went wrong");
    });
  });

  it("loads more feed articles", async () => {
    (window.fetch as jest.Mock)
      .mockImplementationOnce((url: string) => {
        if (url === "/api/brief") return Promise.resolve(defaultBriefResponse);
        return Promise.reject(new Error("Unexpected first call"));
      })
      .mockImplementationOnce((url: string) => {
        if (url === "/api/feed") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{ link: "https://example.com/feed-1" }],
              hasMore: true,
              nextOffset: 1,
            }),
          });
        }
        return Promise.reject(new Error("Unexpected second call"));
      })
      .mockImplementationOnce((url: string) => {
        if (url === "/api/feed") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{ link: "https://example.com/feed-2" }],
              hasMore: false,
              nextOffset: 2,
            }),
          });
        }
        return Promise.reject(new Error("Unexpected third call"));
      });

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view feed" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-articles-count")).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByRole("button", { name: "load more feed" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-articles-count")).toHaveTextContent("1");
    });

    expect(screen.getByTestId("feed-has-more")).toHaveTextContent("false");
  });

  it("retries feed loading after a feed error", async () => {
    (window.fetch as jest.Mock)
      .mockImplementationOnce((url: string) => {
        if (url === "/api/brief") return Promise.resolve(defaultBriefResponse);
        return Promise.reject(new Error("Unexpected first call"));
      })
      .mockImplementationOnce((url: string) => {
        if (url === "/api/feed") {
          return Promise.resolve({
            ok: false,
            json: async () => ({
              error: "Feed exploded",
            }),
          });
        }
        return Promise.reject(new Error("Unexpected second call"));
      })
      .mockImplementationOnce((url: string) => {
        if (url === "/api/feed") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              items: [{ link: "https://example.com/feed-retry" }],
              hasMore: true,
              nextOffset: 1,
            }),
          });
        }
        return Promise.reject(new Error("Unexpected third call"));
      });

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view feed" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-error")).toHaveTextContent("Feed exploded");
      expect(screen.getByTestId("feed-has-more")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "retry feed" }));

    await waitFor(() => {
      expect(screen.getByTestId("feed-error")).toHaveTextContent("");
      expect(screen.getByTestId("feed-articles-count")).toHaveTextContent("1");
    });
  });

  it("loads a saved brief from BriefLogView and switches back to brief view", async () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "view briefs" }));
    fireEvent.click(screen.getByRole("button", { name: "load saved brief" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-view")).toHaveTextContent("brief");
    });

    expect(screen.getByTestId("brief-articles-count")).toHaveTextContent("1");
    expect(screen.getByTestId("brief-last-updated")).toHaveTextContent("2026-03-17T18:00:00.000Z");
    expect(screen.getByTestId("brief-cache")).toHaveTextContent("fresh");
    expect(replace).toHaveBeenLastCalledWith("/?topics=business&limit=7");
  });
});

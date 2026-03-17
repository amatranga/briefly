import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { useRouter, useSearchParams } from "next/navigation";
import { loadJSON, saveJSON } from "@/lib/storage";
import { saveBriefSnapshot } from "@/lib/brief";
import { getUserPreferences, resetUserPreferences } from "@/lib/preferences";
import { DEFAULT_TOPIC_WEIGHTS } from "@/lib/sources";

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
      value: jest.fn(),
    });

    document.documentElement.dataset.theme = "";
  });

  it("renders with default brief view and default topics when URL/storage are empty", () => {
    render(<HomePage />);

    expect(screen.getByTestId("current-view")).toHaveTextContent("brief");
    expect(screen.getByTestId("topics-value")).toHaveTextContent("business");
    expect(screen.getByText("generate brief")).toBeInTheDocument();
  });

  it("initializes topics and limit from URL params", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "topics") return "tech,sports,invalid";
      if (key === "limit") return "7";
      return null;
    });

    render(<HomePage />);

    expect(screen.getByTestId("topics-value")).toHaveTextContent("tech,sports");
    expect(screen.getByTestId("brief-topics-count")).toHaveTextContent("2");
  });

  it("falls back to defaults for invalid URL params", () => {
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === "topics") return "nope,bad";
      if (key === "limit") return "99";
      return null;
    });

    render(<HomePage />);

    expect(screen.getByTestId("topics-value")).toHaveTextContent("business");
    expect(replace).toHaveBeenCalledWith("/?topics=business&limit=5");
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

    expect(getUserPreferences).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "toggle settings" }));

    await waitFor(() => {
      expect(getUserPreferences).toHaveBeenCalledTimes(2);
    });
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

  it("generates a brief successfully", async () => {
    (window.fetch as jest.Mock).mockResolvedValue({
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

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "generate brief" }));

    await waitFor(() => {
      expect(screen.getByTestId("brief-articles-count")).toHaveTextContent("2");
    });

    expect(window.fetch).toHaveBeenCalledWith("/api/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topics: ["business"],
        limit: 5,
        force: false,
        topicWeights: DEFAULT_TOPIC_WEIGHTS,
        userPreferences: mockUserPreferences,
      }),
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
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [],
        lastUpdated: null,
        cache: null,
        errors: [],
      }),
    });

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "regenerate brief" }));

    await waitFor(() => {
      expect(window.fetch).toHaveBeenCalled();
    });

    const fetchArgs = (window.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchArgs[1].body);

    expect(body.force).toBe(true);
  });

  it("shows an error when brief generation fails with a response error", async () => {
    (window.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Server exploded",
      }),
    });

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "generate brief" }));

    await waitFor(() => {
      expect(screen.getByTestId("brief-error")).toHaveTextContent("Server exploded");
    });
  });

  it("shows a fallback error when fetch throws without a message", async () => {
    (window.fetch as jest.Mock).mockRejectedValue({});

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "generate brief" }));

    await waitFor(() => {
      expect(screen.getByTestId("brief-error")).toHaveTextContent("Something went wrong");
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
    expect(screen.getByTestId("brief-last-updated")).toHaveTextContent("2026-03-17T12:00:00.000Z");
    expect(screen.getByTestId("brief-cache")).toHaveTextContent("fresh");
    expect(replace).toHaveBeenLastCalledWith("/?topics=business&limit=7");
  });
});

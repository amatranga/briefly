import { render, screen, fireEvent } from "@testing-library/react";
import { BriefResults } from "@/components/BriefResults";
import { isBookmarked } from "@/lib/bookmark";
import { isRead } from "@/lib/history";
import { getArticleFeedback } from "@/lib/preferences";
import type { Article } from "@/lib/types";

jest.mock("@/lib/bookmark", () => ({
  isBookmarked: jest.fn(),
}));

jest.mock("@/lib/history", () => ({
  isRead: jest.fn(),
}));

jest.mock("@/lib/preferences", () => ({
  getArticleFeedback: jest.fn(),
}));

jest.mock("@/components/ArticleMetaData", () => ({
  ArticleMetaData: ({
    sourceName,
    publishedAt,
    read,
  }: {
    sourceName: string;
    publishedAt?: string | null;
    read?: boolean;
  }) => (
    <div data-testid={`metadata-${sourceName}`}>
      metadata:{sourceName}:{publishedAt ?? "none"}:{String(read)}
    </div>
  ),
}));

jest.mock("@/components/ArticleFeedback", () => ({
  ArticleFeedback: ({
    article,
    value,
    onChange,
  }: {
    article: Article;
    value?: "up" | "down";
    onChange: (value?: "up" | "down") => void;
  }) => (
    <div>
      <div data-testid={`feedback-${article.link}`}>feedback:{value ?? "none"}</div>
      <button onClick={() => onChange("up")}>mock feedback up {article.link}</button>
      <button onClick={() => onChange("down")}>mock feedback down {article.link}</button>
      <button onClick={() => onChange(undefined)}>mock feedback clear {article.link}</button>
    </div>
  ),
}));

jest.mock("@/components/BookmarkButton", () => ({
  BookmarkButton: ({
    article,
    bookmarked,
    onChange,
  }: {
    article: Article;
    bookmarked: boolean;
    onChange: (links: Set<string>) => void;
  }) => (
    <div>
      <div data-testid={`bookmark-${article.link}`}>bookmark:{String(bookmarked)}</div>
      <button onClick={() => onChange(new Set([article.link]))}>
        mock bookmark change {article.link}
      </button>
    </div>
  ),
}));

jest.mock("@/components/ArticleContent", () => ({
  ArticleContent: ({
    article,
    descriptionText,
    onRead,
  }: {
    article: Article;
    descriptionText: string;
    onRead: (links: Set<string>) => void;
  }) => (
    <div>
      <div data-testid={`content-${article.link}`}>{descriptionText}</div>
      <button onClick={() => onRead(new Set([article.link]))}>
        mock read change {article.link}
      </button>
    </div>
  ),
}));

describe("BriefResults", () => {
  const articles: Article[] = [
    {
      title: "Article One",
      link: "https://example.com/article-1",
      sourceName: "Source One",
      publishedAt: "2026-03-17T12:00:00.000Z",
      summary: "Summary One",
      description: "Description One",
    } as Article,
    {
      title: "Article Two",
      link: "https://example.com/article-2",
      sourceName: "Source Two",
      publishedAt: null,
      summary: undefined,
      description: "Description Two",
    } as Article,
    {
      title: "Article Three",
      link: "https://example.com/article-3",
      sourceName: "Source Three",
      publishedAt: undefined,
      summary: undefined,
      description: undefined,
    } as Article,
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (isBookmarked as jest.Mock).mockReturnValue(false);
    (isRead as jest.Mock).mockReturnValue(false);
    (getArticleFeedback as jest.Mock).mockReturnValue(undefined);
  });

  it("renders the empty state when there are no articles", () => {
    render(<BriefResults articles={[]} />);

    expect(screen.getByText("No articles yet - generate a brief above.")).toBeInTheDocument();
    expect(screen.queryByText("Your Brief")).not.toBeInTheDocument();
  });

  it("renders the brief heading and one item per article", () => {
    render(<BriefResults articles={articles} />);

    expect(screen.getByText("Your Brief")).toBeInTheDocument();
    expect(screen.getByTestId("metadata-Source One")).toBeInTheDocument();
    expect(screen.getByTestId("metadata-Source Two")).toBeInTheDocument();
    expect(screen.getByTestId("metadata-Source Three")).toBeInTheDocument();
  });

  it("initializes bookmark, read, and feedback state from library functions", () => {
    (isBookmarked as jest.Mock).mockImplementation((link: string) => link === articles[0].link);
    (isRead as jest.Mock).mockImplementation((link: string) => link === articles[1].link);
    (getArticleFeedback as jest.Mock).mockImplementation((link: string) => {
      if (link === articles[0].link) return "up";
      if (link === articles[1].link) return "down";
      return undefined;
    });

    render(<BriefResults articles={articles} />);

    expect(isBookmarked).toHaveBeenCalledWith(articles[0].link);
    expect(isBookmarked).toHaveBeenCalledWith(articles[1].link);
    expect(isBookmarked).toHaveBeenCalledWith(articles[2].link);

    expect(isRead).toHaveBeenCalledWith(articles[0].link);
    expect(isRead).toHaveBeenCalledWith(articles[1].link);
    expect(isRead).toHaveBeenCalledWith(articles[2].link);

    expect(getArticleFeedback).toHaveBeenCalledWith(articles[0].link);
    expect(getArticleFeedback).toHaveBeenCalledWith(articles[1].link);
    expect(getArticleFeedback).toHaveBeenCalledWith(articles[2].link);

    expect(screen.getByTestId(`bookmark-${articles[0].link}`)).toHaveTextContent("bookmark:true");
    expect(screen.getByTestId(`bookmark-${articles[1].link}`)).toHaveTextContent("bookmark:false");

    expect(screen.getByTestId("metadata-Source One")).toHaveTextContent("metadata:Source One:2026-03-17T12:00:00.000Z:false");
    expect(screen.getByTestId("metadata-Source Two")).toHaveTextContent("metadata:Source Two:none:true");
  });

  it("passes summary first, then description, then fallback text to ArticleContent", () => {
    render(<BriefResults articles={articles} />);

    expect(screen.getByTestId(`content-${articles[0].link}`)).toHaveTextContent("Summary One");
    expect(screen.getByTestId(`content-${articles[1].link}`)).toHaveTextContent("Description Two");
    expect(screen.getByTestId(`content-${articles[2].link}`)).toHaveTextContent("No summary available.");
  });

  it("updates bookmark state when BookmarkButton calls onChange", () => {
    render(<BriefResults articles={[articles[0], articles[1]]} />);

    expect(screen.getByTestId(`bookmark-${articles[0].link}`)).toHaveTextContent("bookmark:false");
    expect(screen.getByTestId(`bookmark-${articles[1].link}`)).toHaveTextContent("bookmark:false");

    fireEvent.click(screen.getByRole("button", { name: `mock bookmark change ${articles[1].link}` }));

    expect(screen.getByTestId(`bookmark-${articles[0].link}`)).toHaveTextContent("bookmark:false");
    expect(screen.getByTestId(`bookmark-${articles[1].link}`)).toHaveTextContent("bookmark:true");
  });

  it("updates read state when ArticleContent calls onRead", () => {
    render(<BriefResults articles={[articles[0], articles[1]]} />);

    expect(screen.getByTestId("metadata-Source One")).toHaveTextContent("false");
    expect(screen.getByTestId("metadata-Source Two")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: `mock read change ${articles[0].link}` }));

    expect(screen.getByTestId("metadata-Source One")).toHaveTextContent("true");
    expect(screen.getByTestId("metadata-Source Two")).toHaveTextContent("false");
  });

  it("updates feedback state when ArticleFeedback calls onChange", () => {
    render(<BriefResults articles={[articles[0]]} />);

    expect(screen.getByTestId(`feedback-${articles[0].link}`)).toHaveTextContent("feedback:none");

    fireEvent.click(screen.getByRole("button", { name: `mock feedback up ${articles[0].link}` }));
    expect(screen.getByTestId(`feedback-${articles[0].link}`)).toHaveTextContent("feedback:up");

    fireEvent.click(screen.getByRole("button", { name: `mock feedback down ${articles[0].link}` }));
    expect(screen.getByTestId(`feedback-${articles[0].link}`)).toHaveTextContent("feedback:down");

    fireEvent.click(screen.getByRole("button", { name: `mock feedback clear ${articles[0].link}` }));
    expect(screen.getByTestId(`feedback-${articles[0].link}`)).toHaveTextContent("feedback:none");
  });

  it("recomputes derived state when the articles prop changes", () => {
    (isBookmarked as jest.Mock).mockImplementation((link: string) => link === articles[1].link);
    (isRead as jest.Mock).mockImplementation((link: string) => link === articles[1].link);
    (getArticleFeedback as jest.Mock).mockImplementation((link: string) =>
      link === articles[1].link ? "down" : undefined
    );

    const { rerender } = render(<BriefResults articles={[articles[0]]} />);

    expect(screen.getByTestId(`bookmark-${articles[0].link}`)).toHaveTextContent("bookmark:false");
    expect(screen.getByTestId("metadata-Source One")).toHaveTextContent("false");
    expect(screen.getByTestId(`feedback-${articles[0].link}`)).toHaveTextContent("feedback:none");

    rerender(<BriefResults articles={[articles[1]]} />);

    expect(screen.getByTestId(`bookmark-${articles[1].link}`)).toHaveTextContent("bookmark:true");
    expect(screen.getByTestId("metadata-Source Two")).toHaveTextContent("true");
    expect(screen.getByTestId(`feedback-${articles[1].link}`)).toHaveTextContent("feedback:down");
  });
});

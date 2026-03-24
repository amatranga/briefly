import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedView } from "@/components/FeedView";
import type { Article } from "@/lib/types";

jest.mock("@/components/BriefResults", () => ({
  BriefResults: ({ articles }: { articles: Article[] }) => (
    <div data-testid="brief-results">brief results count: {articles.length}</div>
  ),
}));

jest.mock("@/components/Spinner", () => ({
  Spinner: () => <div data-testid="spinner">spinner</div>,
}));

describe("FeedView", () => {
  const articles: Article[] = [
    {
      title: "Article One",
      link: "https://example.com/article-1",
      sourceName: "Source One",
      description: "Description one",
    } as Article,
    {
      title: "Article Two",
      link: "https://example.com/article-2",
      sourceName: "Source Two",
      description: "Description two",
    } as Article,
  ];

  let observe: jest.Mock;
  let disconnect: jest.Mock;
  let intersectionCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null;

  beforeEach(() => {
    jest.clearAllMocks();

    observe = jest.fn();
    disconnect = jest.fn();
    intersectionCallback = null;

    class MockIntersectionObserver {
      constructor(
        callback: (entries: Array<{ isIntersecting: boolean }>) => void
      ) {
        intersectionCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
    }

    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it("renders the initial loading state when loading and there are no articles", () => {
    render(
      <FeedView
        articles={[]}
        loading
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.getByText("Loading your feed...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText("Your Feed")).not.toBeInTheDocument();
  });

  it("renders the initial error state when there is an error and no articles", () => {
    render(
      <FeedView
        articles={[]}
        loading={false}
        loadingMore={false}
        error="Feed exploded"
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.getByText("Feed exploded")).toBeInTheDocument();
    expect(screen.queryByText("Your Feed")).not.toBeInTheDocument();
  });

  it("renders the feed heading and brief results when articles exist", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Your Feed" })).toBeInTheDocument();
    expect(screen.getByTestId("brief-results")).toHaveTextContent("brief results count: 2");
  });

  it("renders loading-more state when loadingMore is true", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.getByText("Loading more...")).toBeInTheDocument();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("renders end-of-feed message when there are articles and hasMore is false", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore={false}
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.getByText("You’ve reached the end of the feed.")).toBeInTheDocument();
  });

  it("renders retry UI when there is an error and articles already exist", () => {
    const onRetry = jest.fn();

    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error="Could not load more"
        hasMore
        onLoadMore={jest.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getAllByText("Could not load more")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry loading more" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when there is an error with articles but onRetry is not provided", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error="Could not load more"
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: "Retry loading more" })).not.toBeInTheDocument();
  });

  it("observes the sentinel when pagination is allowed", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(observe).toHaveBeenCalledTimes(1);
  });

  it("calls onLoadMore when the sentinel intersects", async () => {
    const onLoadMore = jest.fn();

    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={onLoadMore}
      />
    );

    expect(intersectionCallback).toBeTruthy();

    intersectionCallback?.([{ isIntersecting: true }]);

    await waitFor(() => {
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });
  });

  it("does not call onLoadMore when the sentinel does not intersect", async () => {
    const onLoadMore = jest.fn();

    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={onLoadMore}
      />
    );

    intersectionCallback?.([{ isIntersecting: false }]);

    await waitFor(() => {
      expect(onLoadMore).not.toHaveBeenCalled();
    });
  });

  it("does not attach an observer when hasMore is false", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore={false}
        onLoadMore={jest.fn()}
      />
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it("does not attach an observer when loading is true", () => {
    render(
      <FeedView
        articles={articles}
        loading
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it("does not attach an observer when loadingMore is true", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it("does not attach an observer when error is present", () => {
    render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error="Feed error"
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    expect(observe).not.toHaveBeenCalled();
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(
      <FeedView
        articles={articles}
        loading={false}
        loadingMore={false}
        error={null}
        hasMore
        onLoadMore={jest.fn()}
      />
    );

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});

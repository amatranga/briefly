import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { toggleBookmark } from "@/lib/bookmark";
import { applyArticleSignal } from "@/lib/preferences";
import type { Article } from "@/lib/types";

jest.mock("@/lib/bookmark", () => ({
  toggleBookmark: jest.fn(),
}));

jest.mock("@/lib/preferences", () => ({
  applyArticleSignal: jest.fn(),
}));

describe("BookmarkButton", () => {
  const article: Article = {
    title: "Test Article",
    link: "https://example.com/test-article",
    description: "Original description",
  } as Article;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders an unbookmarked button", () => {
    render(
      <BookmarkButton
        article={article}
        bookmarked={false}
        onChange={jest.fn()}
      />
    );

    const button = screen.getByTitle("Save to bookmarks");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("☆");
  });

  it("renders a bookmarked button", () => {
    render(
      <BookmarkButton
        article={article}
        bookmarked
        onChange={jest.fn()}
      />
    );

    const button = screen.getByTitle("Remove bookmark");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("★");
  });

  it("adds a bookmark, applies a medium signal, and notifies parent with links", () => {
    const onChange = jest.fn();

    (toggleBookmark as jest.Mock).mockReturnValue({
      action: "added",
      items: [
        { link: "https://example.com/test-article" },
        { link: "https://example.com/another-article" },
      ],
    });

    render(
      <BookmarkButton
        article={article}
        bookmarked={false}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Save to bookmarks"));

    expect(toggleBookmark).toHaveBeenCalledWith(article);
    expect(applyArticleSignal).toHaveBeenCalledWith(article, "medium");
    expect(onChange).toHaveBeenCalledTimes(1);

    const resultSet = onChange.mock.calls[0][0];
    expect(resultSet).toBeInstanceOf(Set);
    expect([...resultSet]).toEqual([
      "https://example.com/test-article",
      "https://example.com/another-article",
    ]);
  });

  it("removes a bookmark and does not apply a medium signal", () => {
    const onChange = jest.fn();

    (toggleBookmark as jest.Mock).mockReturnValue({
      action: "removed",
      items: [{ link: "https://example.com/another-article" }],
    });

    render(
      <BookmarkButton
        article={article}
        bookmarked
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Remove bookmark"));

    expect(toggleBookmark).toHaveBeenCalledWith(article);
    expect(applyArticleSignal).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);

    const resultSet = onChange.mock.calls[0][0];
    expect(resultSet).toBeInstanceOf(Set);
    expect([...resultSet]).toEqual([
      "https://example.com/another-article",
    ]);
  });
});

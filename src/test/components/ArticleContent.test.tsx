import { render, screen, fireEvent } from "@testing-library/react";
import { ArticleContent } from "@/components/ArticleContent";
import { markAsRead } from "@/lib/history";
import { applyArticleSignal } from "@/lib/preferences";

jest.mock("@/lib/history", () => ({
  markAsRead: jest.fn(),
}));

jest.mock("@/lib/preferences", () => ({
  applyArticleSignal: jest.fn(),
}));

describe("ArticleContent", () => {
  const article = {
    title: "Test Article",
    link: "https://example.com/test-article",
    description: "Original description",
  };

  const descriptionText = "Rendered description text";

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  it("renders the article link and description text", () => {
    render(
      <ArticleContent
        article={article as any}
        descriptionText={descriptionText}
        onRead={jest.fn()}
      />
    );

    const link = screen.getByRole("link", { name: "Test Article" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", article.link);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    expect(screen.getByText(descriptionText)).toBeInTheDocument();
  });

  it("handles click: marks as read, applies signal, and calls onRead with links", () => {
    const onRead = jest.fn();

    (markAsRead as jest.Mock).mockReturnValue([
      { link: "https://example.com/test-article" },
      { link: "https://example.com/another-article" },
    ]);

    render(
      <ArticleContent
        article={article as any}
        descriptionText={descriptionText}
        onRead={onRead}
      />
    );

    const link = screen.getByRole("link", { name: "Test Article" });
    fireEvent.click(link);

    expect(markAsRead).toHaveBeenCalledWith(article);
    expect(applyArticleSignal).toHaveBeenCalledWith(article, "weak");

    expect(onRead).toHaveBeenCalledTimes(1);

    const resultSet = onRead.mock.calls[0][0];
    expect(resultSet).toBeInstanceOf(Set);
    expect([...resultSet]).toEqual([
      "https://example.com/test-article",
      "https://example.com/another-article",
    ]);
  });
});

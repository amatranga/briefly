import { render, screen, fireEvent } from "@testing-library/react";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { setArticleFeedback } from "@/lib/preferences";
import type { Article } from "@/lib/types";

jest.mock("@/lib/preferences", () => ({
  setArticleFeedback: jest.fn(),
}));

describe("ArticleFeedback", () => {
  const article: Article = {
    title: "Test Article",
    link: "https://example.com/test-article",
    description: "Original description",
  } as Article;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders thumbs up and thumbs down buttons", () => {
    render(
      <ArticleFeedback
        article={article}
        value={undefined}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByTitle("Show more like this")).toBeInTheDocument();
    expect(screen.getByTitle("Show less like this")).toBeInTheDocument();
  });

  it("applies 'up' feedback when thumbs up is clicked", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value={undefined}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show more like this"));

    expect(setArticleFeedback).toHaveBeenCalledWith(article, "up");
    expect(onChange).toHaveBeenCalledWith("up");
  });

  it("applies 'down' feedback when thumbs down is clicked", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value={undefined}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show less like this"));

    expect(setArticleFeedback).toHaveBeenCalledWith(article, "down");
    expect(onChange).toHaveBeenCalledWith("down");
  });

  it("toggles off 'up' feedback when thumbs up is clicked while already selected", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value="up"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show more like this"));

    expect(setArticleFeedback).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("toggles off 'down' feedback when thumbs down is clicked while already selected", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value="down"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show less like this"));

    expect(setArticleFeedback).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("switches from 'up' to 'down'", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value="up"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show less like this"));

    expect(setArticleFeedback).toHaveBeenCalledWith(article, "down");
    expect(onChange).toHaveBeenCalledWith("down");
  });

  it("switches from 'down' to 'up'", () => {
    const onChange = jest.fn();

    render(
      <ArticleFeedback
        article={article}
        value="down"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByTitle("Show more like this"));

    expect(setArticleFeedback).toHaveBeenCalledWith(article, "up");
    expect(onChange).toHaveBeenCalledWith("up");
  });
});

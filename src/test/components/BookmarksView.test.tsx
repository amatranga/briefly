import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarksView } from "@/components/BookmarksView";
import { getBookmarks, removeBookmark } from "@/lib/bookmark";

jest.mock("@/lib/bookmark", () => ({
  getBookmarks: jest.fn(),
  removeBookmark: jest.fn(),
}));

jest.mock("@/components/SearchInput", () => ({
  SearchInput: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => (
    <input
      aria-label={placeholder ?? "search"}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  ),
}));

describe("BookmarksView", () => {
  const bookmarkItems = [
    {
      link: "https://example.com/article-1",
      title: "React Testing Patterns",
      sourceName: "Frontend Weekly",
      summary: "A useful article about testing React components.",
    },
    {
      link: "https://example.com/article-2",
      title: "TypeScript Utility Types",
      sourceName: "TS Journal",
      summary: undefined,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads bookmarks on mount and renders them", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    expect(getBookmarks).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
    expect(screen.getByText("Frontend Weekly")).toBeInTheDocument();
    expect(screen.getByText("TS Journal")).toBeInTheDocument();
  });

  it("shows the empty state when there are no bookmarks", () => {
    (getBookmarks as jest.Mock).mockReturnValue([]);

    render(<BookmarksView />);

    expect(screen.getByText("No saved articles yet.")).toBeInTheDocument();
  });

  it("renders article links with the correct attributes", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    const firstLink = screen.getByRole("link", { name: "React Testing Patterns" });

    expect(firstLink).toHaveAttribute("href", "https://example.com/article-1");
    expect(firstLink).toHaveAttribute("target", "_blank");
    expect(firstLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("filters bookmarks by title", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    fireEvent.change(screen.getByLabelText("Search bookmarks..."), {
      target: { value: "react" },
    });

    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript Utility Types")).not.toBeInTheDocument();
  });

  it("filters bookmarks by source name", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    fireEvent.change(screen.getByLabelText("Search bookmarks..."), {
      target: { value: "ts journal" },
    });

    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
    expect(screen.queryByText("React Testing Patterns")).not.toBeInTheDocument();
  });

  it("treats a whitespace-only search as no filter", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    fireEvent.change(screen.getByLabelText("Search bookmarks..."), {
      target: { value: "   " },
    });

    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
  });

  it("shows empty state when search filtering produces no matches", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);

    render(<BookmarksView />);

    fireEvent.change(screen.getByLabelText("Search bookmarks..."), {
      target: { value: "python" },
    });

    expect(screen.getByText("No saved articles yet.")).toBeInTheDocument();
    expect(screen.queryByText("React Testing Patterns")).not.toBeInTheDocument();
    expect(screen.queryByText("TypeScript Utility Types")).not.toBeInTheDocument();
  });

  it("removes a bookmark and updates the list", () => {
    (getBookmarks as jest.Mock).mockReturnValue(bookmarkItems);
    (removeBookmark as jest.Mock).mockReturnValue([bookmarkItems[1]]);

    render(<BookmarksView />);

    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[0]);

    expect(removeBookmark).toHaveBeenCalledWith("https://example.com/article-1");
    expect(screen.queryByText("React Testing Patterns")).not.toBeInTheDocument();
    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
  });

  it("shows empty state after removing the last bookmark", () => {
    (getBookmarks as jest.Mock).mockReturnValue([bookmarkItems[0]]);
    (removeBookmark as jest.Mock).mockReturnValue([]);

    render(<BookmarksView />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeBookmark).toHaveBeenCalledWith("https://example.com/article-1");
    expect(screen.getByText("No saved articles yet.")).toBeInTheDocument();
  });
});

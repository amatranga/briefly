import { render, screen, fireEvent } from "@testing-library/react";
import { HistoryView } from "@/components/HistoryView";
import { clearHistory, getHistory } from "@/lib/history";

jest.mock("@/lib/history", () => ({
  clearHistory: jest.fn(),
  getHistory: jest.fn(),
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

describe("HistoryView", () => {
  const historyItems = [
    {
      link: "https://example.com/article-1",
      title: "React Testing Patterns",
      sourceName: "Frontend Weekly",
      readAt: "2026-03-17T15:30:00.000Z",
    },
    {
      link: "https://example.com/article-2",
      title: "TypeScript Utility Types",
      sourceName: "TS Journal",
      readAt: "2026-03-16T10:00:00.000Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads history on mount and renders items", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    expect(getHistory).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Reading History")).toBeInTheDocument();
    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
    expect(screen.getByText(/Frontend Weekly/)).toBeInTheDocument();
    expect(screen.getByText(/TS Journal/)).toBeInTheDocument();
  });

  it("shows the empty state when there is no history", () => {
    (getHistory as jest.Mock).mockReturnValue([]);

    render(<HistoryView />);

    expect(screen.getByText("No read articles yet.")).toBeInTheDocument();
  });

  it("renders read timestamps", () => {
    (getHistory as jest.Mock).mockReturnValue([historyItems[0]]);

    render(<HistoryView />);

    const expectedDate = new Date(historyItems[0].readAt).toLocaleString();
    expect(screen.getByText(new RegExp(`Read ${expectedDate}`))).toBeInTheDocument();
  });

  it("renders article links with the correct attributes", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    const link = screen.getByRole("link", { name: "React Testing Patterns" });

    expect(link).toHaveAttribute("href", "https://example.com/article-1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("filters history by title", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    fireEvent.change(screen.getByLabelText("Search history..."), {
      target: { value: "react" },
    });

    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.queryByText("TypeScript Utility Types")).not.toBeInTheDocument();
  });

  it("filters history by source name", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    fireEvent.change(screen.getByLabelText("Search history..."), {
      target: { value: "ts journal" },
    });

    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
    expect(screen.queryByText("React Testing Patterns")).not.toBeInTheDocument();
  });

  it("treats a whitespace-only search as no filter", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    fireEvent.change(screen.getByLabelText("Search history..."), {
      target: { value: "   " },
    });

    expect(screen.getByText("React Testing Patterns")).toBeInTheDocument();
    expect(screen.getByText("TypeScript Utility Types")).toBeInTheDocument();
  });

  it("shows empty state when search filtering finds no matches", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    fireEvent.change(screen.getByLabelText("Search history..."), {
      target: { value: "python" },
    });

    expect(screen.getByText("No read articles yet.")).toBeInTheDocument();
    expect(screen.queryByText("React Testing Patterns")).not.toBeInTheDocument();
    expect(screen.queryByText("TypeScript Utility Types")).not.toBeInTheDocument();
  });

  it("clears history and updates the UI", () => {
    (getHistory as jest.Mock).mockReturnValue(historyItems);

    render(<HistoryView />);

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(clearHistory).toHaveBeenCalledTimes(1);
    expect(screen.getByText("No read articles yet.")).toBeInTheDocument();
  });
});

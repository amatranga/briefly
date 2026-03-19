import { render, screen, fireEvent } from "@testing-library/react";
import { BriefLogView } from "@/components/BriefLogView";
import { clearBriefs, getBriefs, removeBrief } from "@/lib/brief";
import type { BriefSnapshot } from "@/lib/types";

jest.mock("@/lib/brief", () => ({
  clearBriefs: jest.fn(),
  getBriefs: jest.fn(),
  removeBrief: jest.fn(),
}));

describe("BriefLogView", () => {
  const briefs: BriefSnapshot[] = [
    {
      id: "brief-1",
      generatedAt: "2026-03-17T15:30:00.000Z",
      topics: ["React", "TypeScript"],
      limit: 5,
      cache: "hit",
      items: [
        { link: "https://example.com/1" },
        { link: "https://example.com/2" },
      ],
      errors: [{ sourceId: "Feed_A", sourceName: "Source A", error: "Timeout" }],
    } as BriefSnapshot,
    {
      id: "brief-2",
      generatedAt: "2026-03-16T10:00:00.000Z",
      topics: ["Testing"],
      limit: 3,
      items: [{ link: "https://example.com/3" }],
      errors: [],
    } as BriefSnapshot,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads briefs on mount and renders them", () => {
    (getBriefs as jest.Mock).mockReturnValue(briefs);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    expect(getBriefs).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Brief Log")).toBeInTheDocument();

    expect(screen.getByText(/React, TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/Testing/)).toBeInTheDocument();
    expect(screen.getByText("2 articles · 1 source errors")).toBeInTheDocument();
    expect(screen.getByText("1 articles")).toBeInTheDocument();
  });

  it("shows the empty state when there are no saved briefs", () => {
    (getBriefs as jest.Mock).mockReturnValue([]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    expect(screen.getByText("No saved briefs yet.")).toBeInTheDocument();
  });

  it("renders generated date, topics, limit, and cache when present", () => {
    (getBriefs as jest.Mock).mockReturnValue([briefs[0]]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    const expectedDate = new Date(briefs[0].generatedAt).toLocaleString();

    expect(screen.getByText(new RegExp(expectedDate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))).toBeInTheDocument();
    expect(screen.getByText(/React, TypeScript/)).toBeInTheDocument();
    expect(screen.getByText(/limit 5/)).toBeInTheDocument();
    expect(screen.getByText(/hit/)).toBeInTheDocument();
  });

  it("does not render cache text when cache is missing", () => {
    (getBriefs as jest.Mock).mockReturnValue([briefs[1]]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    expect(screen.getByText(/Testing/)).toBeInTheDocument();
    expect(screen.getByText(/limit 3/)).toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it("calls onLoadBrief with the selected brief when Load is clicked", () => {
    (getBriefs as jest.Mock).mockReturnValue([briefs[0]]);
    const onLoadBrief = jest.fn();

    render(<BriefLogView onLoadBrief={onLoadBrief} />);

    fireEvent.click(screen.getByRole("button", { name: "Load" }));

    expect(onLoadBrief).toHaveBeenCalledTimes(1);
    expect(onLoadBrief).toHaveBeenCalledWith(briefs[0]);
  });

  it("removes a brief and updates the list", () => {
    (getBriefs as jest.Mock).mockReturnValue(briefs);
    (removeBrief as jest.Mock).mockReturnValue([briefs[1]]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    fireEvent.click(removeButtons[0]);

    expect(removeBrief).toHaveBeenCalledWith("brief-1");
    expect(screen.queryByText(/React, TypeScript/)).not.toBeInTheDocument();
    expect(screen.getByText(/Testing/)).toBeInTheDocument();
  });

  it("shows the empty state after removing the last brief", () => {
    (getBriefs as jest.Mock).mockReturnValue([briefs[0]]);
    (removeBrief as jest.Mock).mockReturnValue([]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeBrief).toHaveBeenCalledWith("brief-1");
    expect(screen.getByText("No saved briefs yet.")).toBeInTheDocument();
  });

  it("clears all briefs when Clear is clicked", () => {
    (getBriefs as jest.Mock).mockReturnValue(briefs);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(clearBriefs).toHaveBeenCalledTimes(1);
    expect(screen.getByText("No saved briefs yet.")).toBeInTheDocument();
  });

  it("renders only article count when there are no source errors", () => {
    (getBriefs as jest.Mock).mockReturnValue([briefs[1]]);

    render(<BriefLogView onLoadBrief={jest.fn()} />);

    expect(screen.getByText("1 articles")).toBeInTheDocument();
    expect(screen.queryByText(/source errors/)).not.toBeInTheDocument();
  });
});

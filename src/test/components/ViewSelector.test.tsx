import { render, screen, fireEvent } from "@testing-library/react";
import { ViewSelector } from "@/components/ViewSelector";
import { VIEWS } from "@/lib/types";

describe("ViewSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const format = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

  it("renders a button for each view", () => {
    render(<ViewSelector view={VIEWS[0]} onChange={jest.fn()} />);

    for (const v of VIEWS) {
      expect(screen.getByRole("button", { name: format(v) })).toBeInTheDocument();
    }
  });

  it("capitalizes view labels", () => {
    render(<ViewSelector view={VIEWS[0]} onChange={jest.fn()} />);

    for (const v of VIEWS) {
      expect(screen.getByText(format(v))).toBeInTheDocument();
    }
  });

  it("calls onChange with the selected view when clicked", () => {
    const onChange = jest.fn();

    render(<ViewSelector view={VIEWS[0]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: format(VIEWS[1]) }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(VIEWS[1]);
  });

  it("applies active styles to the selected view", () => {
    const activeView = VIEWS[1];

    render(<ViewSelector view={activeView} onChange={jest.fn()} />);

    const activeButton = screen.getByRole("button", {
      name: format(activeView),
    });

    expect(activeButton).toHaveStyle({
      background: "var(--card)",
      fontWeight: "700",
    });
  });

  it("applies inactive styles to non-selected views", () => {
    const activeView = VIEWS[0];

    render(<ViewSelector view={activeView} onChange={jest.fn()} />);

    for (const v of VIEWS.slice(1)) {
      const button = screen.getByRole("button", {
        name: format(v),
      });

      expect(button).toHaveStyle({
        background: "transparent",
        fontWeight: "500",
      });
    }
  });
});

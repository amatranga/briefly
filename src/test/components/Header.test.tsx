import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/Header";

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and subtitle", () => {
    render(<Header theme="light" onToggleTheme={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Briefly" })).toBeInTheDocument();
    expect(
      screen.getByText("Pick topics and generate a quick daily brief.")
    ).toBeInTheDocument();
  });

  it("shows the moon icon when theme is light", () => {
    render(<Header theme="light" onToggleTheme={jest.fn()} />);

    expect(screen.getByRole("button")).toHaveTextContent("🌙");
  });

  it("shows the sun icon when theme is dark", () => {
    render(<Header theme="dark" onToggleTheme={jest.fn()} />);

    expect(screen.getByRole("button")).toHaveTextContent("☀️");
  });

  it("calls onToggleTheme when the theme button is clicked", () => {
    const onToggleTheme = jest.fn();

    render(<Header theme="light" onToggleTheme={onToggleTheme} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });
});

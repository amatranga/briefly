import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/Spinner";

describe("Spinner", () => {
  it("renders the spinner element", () => {
    render(<Spinner />);

    const spinner = screen.getByLabelText("Loading");
    expect(spinner).toBeInTheDocument();
  });

  it("has the correct accessibility label", () => {
    render(<Spinner />);

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });

  it("applies the expected base styles", () => {
    render(<Spinner />);

    const spinner = screen.getByLabelText("Loading");

    expect(spinner).toHaveStyle({
      display: "inline-block",
      width: "14px",
      height: "14px",
      borderRadius: "50%",
    });
  });

  it("applies the spinning animation style", () => {
    render(<Spinner />);

    const spinner = screen.getByLabelText("Loading");

    expect(spinner).toHaveStyle({
      animation: "spin 0.8s linear infinite",
    });
  });

  it("applies the correct border styling for spinner effect", () => {
    render(<Spinner />);

    const spinner = screen.getByLabelText("Loading");

    expect(spinner).toHaveStyle({
      border: "2px solid rgba(0,0,0,0.2)",
      borderTopColor: "rgba(0,0,0,0.7)",
    });
  });
});

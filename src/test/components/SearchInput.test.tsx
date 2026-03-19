import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "@/components/SearchInput";

describe("SearchInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with the provided value", () => {
    render(
      <SearchInput
        value="React"
        onChange={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
  });

  it("uses the default placeholder when none is provided", () => {
    render(
      <SearchInput
        value=""
        onChange={jest.fn()}
      />
    );

    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("uses a custom placeholder when provided", () => {
    render(
      <SearchInput
        value=""
        onChange={jest.fn()}
        placeholder="Search bookmarks..."
      />
    );

    expect(screen.getByPlaceholderText("Search bookmarks...")).toBeInTheDocument();
  });

  it("calls onChange with the updated value", () => {
    const onChange = jest.fn();

    render(
      <SearchInput
        value=""
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "TypeScript" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("TypeScript");
  });
});

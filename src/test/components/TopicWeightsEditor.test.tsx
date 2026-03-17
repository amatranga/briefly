import { render, screen, fireEvent } from "@testing-library/react";
import { TopicWeightsEditor } from "@/components/TopicWeightsEditor";
import type { Topic, TopicWeights } from "@/lib/types";

describe("TopicWeightsEditor", () => {
  const topics = ["business", "tech", "markets"] as any;

  const weights: TopicWeights = {
    business: 1,
    tech: 3,
    markets: 5,
  } as TopicWeights;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when topics is empty", () => {
    const { container } = render(
      <TopicWeightsEditor
        topics={[]}
        weights={{} as TopicWeights}
        onChange={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders the helper text and heading when topics exist", () => {
    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={jest.fn()}
      />
    );

    expect(
      screen.getByText("Adjust topic priority to influence how articles are ranked.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Ranking Priority" })
    ).toBeInTheDocument();
  });

  it("renders one range input per topic", () => {
    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={jest.fn()}
      />
    );

    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(topics.length);
  });

  it("renders each topic label", () => {
    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={jest.fn()}
      />
    );

    for (const topic of topics) {
      expect(screen.getByText(new RegExp(`^${topic}$`, "i"))).toBeInTheDocument();
    }
  });

  it("uses the current weight values for each slider", () => {
    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={jest.fn()}
      />
    );

    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveValue("1");
    expect(sliders[1]).toHaveValue("3");
    expect(sliders[2]).toHaveValue("5");
  });

  it("shows the numeric weight for each topic", () => {
    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onChange with updated weights when a slider value changes", () => {
    const onChange = jest.fn();

    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={onChange}
      />
    );

    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[1], { target: { value: "4" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ...weights,
      tech: 4,
    });
  });

  it("preserves other topic weights when updating one topic", () => {
    const onChange = jest.fn();

    render(
      <TopicWeightsEditor
        topics={topics}
        weights={weights}
        onChange={onChange}
      />
    );

    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "2" } });

    expect(onChange).toHaveBeenCalledWith({
      business: 2,
      tech: 3,
      markets: 5,
    });
  });
});

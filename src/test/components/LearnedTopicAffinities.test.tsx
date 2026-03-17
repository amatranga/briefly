import { render, screen } from "@testing-library/react";
import { LearnedTopicAffinities } from "@/components/LearnedTopicAffinities";
import { TOPICS } from "@/lib/types";
import type { UserPreferences } from "@/lib/types";

describe("LearnedTopicAffinities", () => {
  const preferences: UserPreferences = {
    topicAffinity: Object.fromEntries(
      TOPICS.map(topic => [topic, 0])
    ),
  } as UserPreferences;

  preferences.topicAffinity[TOPICS[0]] = 1.234;
  preferences.topicAffinity[TOPICS[1]] = -0.5;
  preferences.topicAffinity[TOPICS[2]] = 0;

  const zeroTopic = TOPICS[2];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the heading and helper text", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    expect(
      screen.getByRole("heading", { name: "Learned Topic Affinities" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "These values are updated over time based on clicks, bookmarks, and explicit feedback."
      )
    ).toBeInTheDocument();
  });

  it("renders all topics", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    for (const topic of TOPICS) {
      expect(screen.getByText(new RegExp(`^${topic}$`, "i"))).toBeInTheDocument();
    }
  });

  it("formats positive values with a leading plus sign", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    expect(screen.getByText("+1.23")).toBeInTheDocument();
  });

  it("formats negative values without a leading plus sign", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    expect(screen.getByText("-0.50")).toBeInTheDocument();
  });

  it("formats zero values as 0.00", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    const topicLabel = screen.getByText(new RegExp(`^${zeroTopic}$`, "i"));
    const valueElement = topicLabel.nextSibling as HTMLElement;

    expect(valueElement).toHaveTextContent("0.00");
  });

  it("applies green text color to positive values", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    expect(screen.getByText("+1.23")).toHaveStyle({ color: "#16a34a" });
  });

  it("applies red text color to negative values", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    expect(screen.getByText("-0.50")).toHaveStyle({ color: "#dc2626" });
  });

  it("applies muted color to zero values", () => {
    render(<LearnedTopicAffinities preferences={preferences} />);

    const topicLabel = screen.getByText(new RegExp(`^${zeroTopic}$`, "i"));
    const valueElement = topicLabel.nextSibling as HTMLElement;

    expect(valueElement).toHaveStyle({ color: "var(--muted)" });
  });
});

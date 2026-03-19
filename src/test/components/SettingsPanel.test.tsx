import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPanel } from "@/components/SettingsPanel";
import type { TopicWeights, UserPreferences } from "@/lib/types";

jest.mock("@/components/TopicWeightsEditor", () => ({
  TopicWeightsEditor: ({
    topics,
    weights,
    onChange,
  }: {
    topics: string[];
    weights: Record<string, number>;
    onChange: (weights: Record<string, number>) => void;
  }) => (
    <div>
      <div data-testid="topic-weights-editor">
        topics:{topics.join(",")}
        {" | "}
        weights:{JSON.stringify(weights)}
      </div>
      <button
        onClick={() =>
          onChange({
            ...weights,
            [topics[0]]: 99,
          })
        }
      >
        mock change topic weights
      </button>
    </div>
  ),
}));

jest.mock("@/components/LearnedTopicAffinities", () => ({
  LearnedTopicAffinities: ({
    preferences,
  }: {
    preferences: UserPreferences;
  }) => (
    <div data-testid="learned-topic-affinities">
      affinities:{JSON.stringify(preferences.topicAffinity)}
    </div>
  ),
}));

describe("SettingsPanel", () => {
  const topics = ["business", "tech", "markets"] as any;

  const topicWeights: TopicWeights = {
    business: 1,
    tech: 2,
    markets: 3,
  } as TopicWeights;

  const userPreferences: UserPreferences = {
    topicAffinity: {
      business: 0.5,
      tech: -0.25,
      markets: 0,
    },
  } as UserPreferences;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 'Show Settings' when settings are hidden", () => {
    render(
      <SettingsPanel
        showSettings={false}
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Show Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Settings" })).not.toBeInTheDocument();
  });

  it("renders 'Hide Settings' and the settings panel when settings are shown", () => {
    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Hide Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
  });

  it("calls onToggle when the toggle button is clicked", () => {
    const onToggle = jest.fn();

    render(
      <SettingsPanel
        showSettings={false}
        onToggle={onToggle}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Show Settings" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders TopicWeightsEditor with the provided topics and weights when shown", () => {
    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.getByTestId("topic-weights-editor")).toBeInTheDocument();
    expect(screen.getByTestId("topic-weights-editor")).toHaveTextContent(
      "topics:business,tech,markets"
    );
    expect(screen.getByTestId("topic-weights-editor")).toHaveTextContent(
      `weights:${JSON.stringify(topicWeights)}`
    );
  });

  it("passes onTopicWeightsChange through to TopicWeightsEditor", () => {
    const onTopicWeightsChange = jest.fn();

    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={onTopicWeightsChange}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "mock change topic weights" }));

    expect(onTopicWeightsChange).toHaveBeenCalledTimes(1);
    expect(onTopicWeightsChange).toHaveBeenCalledWith({
      ...topicWeights,
      business: 99,
    });
  });

  it("renders LearnedTopicAffinities and reset button when userPreferences exist", () => {
    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.getByTestId("learned-topic-affinities")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset Personalization" })
    ).toBeInTheDocument();
  });

  it("does not render LearnedTopicAffinities or reset button when userPreferences is null", () => {
    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={null}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.queryByTestId("learned-topic-affinities")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Reset Personalization" })
    ).not.toBeInTheDocument();
  });

  it("calls onResetPersonalization when reset button is clicked", () => {
    const onResetPersonalization = jest.fn();

    render(
      <SettingsPanel
        showSettings
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={onResetPersonalization}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Reset Personalization" }));

    expect(onResetPersonalization).toHaveBeenCalledTimes(1);
  });

  it("does not render child content when showSettings is false", () => {
    render(
      <SettingsPanel
        showSettings={false}
        onToggle={jest.fn()}
        topics={topics}
        topicWeights={topicWeights}
        onTopicWeightsChange={jest.fn()}
        userPreferences={userPreferences}
        onResetPersonalization={jest.fn()}
      />
    );

    expect(screen.queryByTestId("topic-weights-editor")).not.toBeInTheDocument();
    expect(screen.queryByTestId("learned-topic-affinities")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reset Personalization" })).not.toBeInTheDocument();
  });
});

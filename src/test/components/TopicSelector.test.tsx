import { render, screen, fireEvent } from "@testing-library/react";
import { TopicSelector } from "@/components/TopicSelector";
import { TOPICS } from "@/lib/types";
import type { Topic } from "@/lib/types";

describe("TopicSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the heading", () => {
    render(<TopicSelector value={[]} onChange={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Select Topics" })).toBeInTheDocument();
  });

  it("renders a checkbox for every topic", () => {
    render(<TopicSelector value={[]} onChange={jest.fn()} />);

    for (const topic of TOPICS) {
      expect(screen.getByLabelText(topic)).toBeInTheDocument();
    }
  });

  it("checks topics that are included in value", () => {
    const selectedTopics = [TOPICS[0], TOPICS[1]] as Topic[];

    render(<TopicSelector value={selectedTopics} onChange={jest.fn()} />);

    expect(screen.getByLabelText(TOPICS[0])).toBeChecked();
    expect(screen.getByLabelText(TOPICS[1])).toBeChecked();
  });

  it("leaves topics unchecked when they are not included in value", () => {
    const selectedTopics = [TOPICS[0]] as Topic[];

    render(<TopicSelector value={selectedTopics} onChange={jest.fn()} />);

    expect(screen.getByLabelText(TOPICS[0])).toBeChecked();

    for (const topic of TOPICS.slice(1)) {
      expect(screen.getByLabelText(topic)).not.toBeChecked();
    }
  });

  it("adds a topic when an unchecked checkbox is clicked", () => {
    const onChange = jest.fn();
    const selectedTopics = [TOPICS[0]] as Topic[];

    render(<TopicSelector value={selectedTopics} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText(TOPICS[1]));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([TOPICS[0], TOPICS[1]]);
  });

  it("removes a topic when a checked checkbox is clicked", () => {
    const onChange = jest.fn();
    const selectedTopics = [TOPICS[0], TOPICS[1]] as Topic[];

    render(<TopicSelector value={selectedTopics} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText(TOPICS[1]));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith([TOPICS[0]]);
  });
});

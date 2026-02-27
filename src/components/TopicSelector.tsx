"use client";

import { TOPICS, type Topic } from '@/lib/sources';

type TopicSelectorProps = {
  value: Topic[];
  onChange: (topics: Topic[]) => void;
};

const TopicSelector = ({ value, onChange }: TopicSelectorProps) => {
  const toggleTopic = (topic: Topic) => {
    if (value.includes(topic)) {
      onChange(value.filter(t => t !== topic));
    } else {
      onChange([...value, topic]);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <h3>Select Topics</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {TOPICS.map(topic => (
          <label key={topic} style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={value.includes(topic)}
              onChange={() => toggleTopic(topic)}
              style={{ marginRight: 6 }}
            />
            {topic}
          </label>
        ))}
      </div>
    </div>
  )
}

export { TopicSelector };

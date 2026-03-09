"use client";

import { TopicWeights, type Topic } from "@/lib/types";

type TopicWeightsEditorProps = {
  topics: Topic[];
  weights: TopicWeights;
  onChange: (weights: TopicWeights) => void;
};

const TopicWeightsEditor = ({
  topics,
  weights,
  onChange,
}: TopicWeightsEditorProps) => {
  if (!topics.length) return null;

  const updateWeight = (topic: Topic, value: number) => {
    onChange({
      ...weights,
      [topic]: value,
    });
  };

  return (
    <div style={{ marginTop: 12, marginBottom: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Ranking Priority</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "140px minmax(180px, 260px) 32px",
          gap: "10px 16px",
          alignItems: "center",
        }}
      >
        {topics.map((topic) => (
          <label
            key={topic}
            style={{ display: "contents" }}
          >
            <span style={{ textTransform: "capitalize" }}>{topic}</span>

            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={weights[topic]}
              onChange={(e) => updateWeight(topic, Number(e.target.value))}
              style={{ width: "100%" }}
            />

            <span style={{ textAlign: "right" }}>{weights[topic]}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export { TopicWeightsEditor };

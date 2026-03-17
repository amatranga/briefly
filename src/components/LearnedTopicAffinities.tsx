"use client";

import { TOPICS } from "@/lib/types";
import type { UserPreferences } from "@/lib/types";

type LearnedTopicAffinitiesProps = {
  preferences: UserPreferences;
};

const formatAffinity = (value: number): string => {
  if (value > 0) return `+${value.toFixed(2)}`;
  return value.toFixed(2);
};

const getAffinityColor = (value: number): string => {
  if (value > 0) return "#16a34a";
  if (value < 0) return "#dc2626";
  return "var(--muted)";
};

const LearnedTopicAffinities = ({ preferences }: LearnedTopicAffinitiesProps) => (
  <div style={{ marginTop: 16 }}>
    <h3 style={{ marginTop: 0, marginBottom: 8 }}>Learned Topic Affinities</h3>

    <p className="small" style={{ marginTop: 0, marginBottom: 12 }}>
      These values are updated over time based on clicks, bookmarks, and explicit feedback.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 80px",
        gap: "8px 16px",
        alignItems: "center",
      }}
    >
      {TOPICS.map(topic => {
        const value = preferences.topicAffinity[topic];

        return (
          <div key={topic} style={{ display: "contents" }}>
            <span style={{ textTransform: "capitalize" }}>{topic}</span>
            <span
              style={{
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                color: getAffinityColor(value),
              }}
            >
              {formatAffinity(value)}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export { LearnedTopicAffinities };

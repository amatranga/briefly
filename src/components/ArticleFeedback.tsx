"use client";

import type { Article, FeedbackValue } from "@/lib/types";
import { setArticleFeedback } from "@/lib/preferences";

type ArticleFeedbackProps = {
  article: Article;
  value?: FeedbackValue;
  onChange: (value: FeedbackValue) => void;
};

const ArticleFeedback = ({ article, value, onChange }: ArticleFeedbackProps) => {
  const handleFeedback = (next: FeedbackValue) => {
    const valueToApply = value === next ? undefined : next;
    if (valueToApply) {
      setArticleFeedback(article, next);
    }
    onChange(valueToApply as FeedbackValue);
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
      <button
        onClick={() => handleFeedback("up")}
        style={{
          border: "1px solid var(--border)",
          background: value === "up" ? "var(--border)" : "transparent",
          borderRadius: 8,
          padding: "4px 8px",
          cursor: "pointer",
          color: "var(--text)",
        }}
        title="Show more like this"
      >
        👍
      </button>

      <button
        onClick={() => handleFeedback("down")}
        style={{
          border: "1px solid var(--border)",
          background: value === "down" ? "var(--border)" : "transparent",
          borderRadius: 8,
          padding: "4px 8px",
          cursor: "pointer",
          color: "var(--text)",
        }}
        title="Show less like this"
      >
        👎
      </button>
    </div>
  );
};

export { ArticleFeedback };

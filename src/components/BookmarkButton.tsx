"use client";

import type { Article } from "@/lib/types";
import { toggleBookmark } from "@/lib/bookmark";
import { applyArticleSignal } from "@/lib/preferences";

type BookmarkButtonProps = {
  article: Article;
  bookmarked: boolean;
  onChange: (links: Set<string>) => void;
};

const BookmarkButton = ({ article, bookmarked, onChange }: BookmarkButtonProps) => {
  const handleClick = () => {
    const result = toggleBookmark(article);

    if (result.action === "added") {
      applyArticleSignal(article, "medium");
    }

    onChange(new Set(result.items.map(b => b.link)));
  };

  return (
    <button
      onClick={handleClick}
      title={bookmarked ? "Remove bookmark" : "Save to bookmarks"}
      style={{
        border: "1px solid var(--border)",
        background: "transparent",
        borderRadius: 10,
        padding: "4px 8px",
        cursor: "pointer",
        color: "var(--text)",
        flexShrink: 0,
      }}
    >
      {bookmarked ? "★" : "☆"}
    </button>
  );
};

export { BookmarkButton };

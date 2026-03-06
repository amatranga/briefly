"use client";

import { useEffect, useMemo, useState } from "react";
import type { BookmarkItem } from "@/lib/types";
import { getBookmarks, removeBookmark } from "@/lib/bookmark";
import { SearchInput } from "@/components/SearchInput";

const BookmarksView = () => {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setItems(getBookmarks());
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(article => 
      `${article.title} ${article.sourceName}`.toLowerCase().includes(needle)
    );
  }, [items, query]);

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Bookmarks</h2>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search bookmarks..."
      />

      {!filtered.length ? (
        <p className="small">No saved articles yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map(article => (
            <li key={article.link} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{article.sourceName}</div>
                <button
                  onClick={() => setItems(removeBookmark(article.link))}
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                    borderRadius: 10,
                    padding: "4px 8px",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}>
                    Remove
                  </button>
              </div>

              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "var(--text)",
                }}
              >
                {article.title}
              </a>

              {article.summary ? (
                <p style={{ marginTop: 8, color: "var(--muted)" }}>{article.summary}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { BookmarksView };

"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReadHistoryItem } from "@/lib/types";
import { clearHistory, getHistory } from "@/lib/history";
import { SearchInput } from "@/components/SearchInput";

const HistoryView = () => {
  const [items, setItems] = useState<ReadHistoryItem[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setItems(getHistory());
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Reading History</h2>
        <button
          onClick={() => {
            clearHistory();
            setItems([]);
          }}
          style={{
            border: "1px solid var(--border)",
            background: "transparent",
            borderRadius: 10,
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          Clear
        </button>
      </div>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search history..."
      />

      {!filtered.length ? (
        <p className="small">No read articles yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((a) => (
            <li key={a.link} className="card" style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {a.sourceName} · Read {new Date(a.readAt).toLocaleString()}
              </div>

              <a
                href={a.link}
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
                {a.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { HistoryView };

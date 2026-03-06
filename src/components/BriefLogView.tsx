"use client";

import { useEffect, useState } from "react";
import type { BriefSnapshot } from "@/lib/types";
import { clearBriefs, getBriefs, removeBrief } from "@/lib/brief";

type BriefLogViewProps = {
  onLoadBrief: (snap: BriefSnapshot) => void;
};

const BriefLogView = ({ onLoadBrief }: BriefLogViewProps) => {
  const [briefs, setBriefs] = useState<BriefSnapshot[]>([]);

  useEffect(() => {
    setBriefs(getBriefs());
  }, []);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Brief Log</h2>
        <button
          onClick={() => {
            clearBriefs();
            setBriefs([]);
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

      {!briefs.length ? (
        <p className="small">No saved briefs yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {briefs.map((b) => (
            <li key={b.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {new Date(b.generatedAt).toLocaleString()} · {b.topics.join(", ")} · limit {b.limit}
                  {b.cache ? ` · ${b.cache}` : ""}
                </div>
                <button
                  onClick={() => setBriefs(removeBrief(b.id))}
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                    borderRadius: 10,
                    padding: "4px 8px",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  Remove
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button className="primary" onClick={() => onLoadBrief(b)}>
                  Load
                </button>

                <div className="small" style={{ alignSelf: "center" }}>
                  {b.items.length} articles
                  {b.errors?.length ? ` · ${b.errors.length} source errors` : ""}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export { BriefLogView };

"use client";

import { BriefResults } from "@/components/BriefResults";
import { Spinner } from "@/components/Spinner";
import type { CacheStatus, Article } from "@/lib/types";

type BriefViewProps = {
  topicsCount: number;
  articles: Article[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  cache: CacheStatus;
  onGenerate: () => void;
  onRegenerate: () => void;
};

const BriefView = ({
  topicsCount,
  articles,
  loading,
  error,
  lastUpdated,
  cache,
  onGenerate,
  onRegenerate,
}: BriefViewProps) => (
  <>
    <div style={{ display: "flex", gap: 10 }}>
      <button
        className="primary"
        onClick={onGenerate}
        disabled={loading || topicsCount === 0}
        style={{ opacity: loading ? 0.85 : 1 }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Spinner /> Generating...
          </span>
        ) : (
          "Generate Brief"
        )}
      </button>

      <button
        className="primary"
        onClick={onRegenerate}
        disabled={loading || topicsCount === 0 || articles.length === 0}
        style={{
          background: "transparent",
          color: "var(--text)",
        }}
      >
        Regenerate
      </button>
    </div>

    {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

    {lastUpdated && (
      <p className="small" style={{ marginTop: 12 }}>
        Last updated: {new Date(lastUpdated).toLocaleTimeString()}{" "}
        {cache ? `(${cache})` : ""}
      </p>
    )}

    <BriefResults articles={articles} />
  </>
);

export { BriefView };

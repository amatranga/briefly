import { VIEWS } from "@/lib/types";
import type { View } from "@/lib/types";

type ViewSelectorProps = {
  view: View;
  onChange: (view: View) => void;
};

const ViewSelector = ({ view, onChange }: ViewSelectorProps) => {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
      {VIEWS.map(v => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            border: "1px solid var(--border)",
            background: view === v ? "var(--card)" : "transparent",
            borderRadius: 999,
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--text)",
            fontWeight: view === v ? 700 : 500,
          }}
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
};

export { ViewSelector };

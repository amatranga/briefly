type HeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

const Header = ({ theme, onToggleTheme }: HeaderProps) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <h1 style={{ margin: 0 }}>Briefly</h1>

        <button
          onClick={onToggleTheme}
          style={{
            border: "1px solid var(--border)",
            background: "transparent",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            color: "var(--text)",
          }}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      <p className="small" style={{ marginTop: 6 }}>
        Pick topics and generate a quick daily brief.
      </p>
    </>
  );
};

export { Header };

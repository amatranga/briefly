const Spinner = () => (
  <span
    aria-label="Loading"
    style={{
      display: "inline-block",
      width: 14,
      height: 14,
      border: "2px solid rgba(0,0,0,0.2)",
      borderTopColor: "rgba(0,0,0,0.7)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

export { Spinner };

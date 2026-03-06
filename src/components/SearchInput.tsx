"use client";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const SearchInput = ({ value, onChange, placeholder = "Search..." }: SearchInputProps) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 10px",
        background: "var(--card)",
        color: "var(--text)",
        marginBottom: 12,
      }}
  />
);

export { SearchInput };

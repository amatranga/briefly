import { Article } from "@/lib/types";

type BriefResultsProps = {
  articles: Article[];
};

const BriefResults = ({ articles }: BriefResultsProps) => {
  if (!articles.length) return null;

  return (
    <div style={{ marginTop: 24}}>
      <h2>Your Brief</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {articles.map((article, idx) => (
          <li
            key={idx}
            className="card"
            style={{ marginBottom: 12 }}
          >
            <div style={{ fontSize: 12, color: "#666" }}>
              {article.sourceName}
            </div>

            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 18,
                fontWeight: 600,
                textDecoration: "none",
                color: "#111",
              }}
            >
              {article.title}
            </a>

            <p style={{ marginTop: 8, color: "#444" }}>
              {article.description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { BriefResults };
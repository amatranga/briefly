import type { Article } from "@/lib/types";

type BriefResultsProps = {
  articles: Article[];
};

const BriefResults = ({ articles }: BriefResultsProps) => {
  if (!articles.length) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Your Brief</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {articles.map((article, idx) => {
          const text = article.summary ?? article.description ?? "No summary available.";

          return (
            <li key={idx} className="card" style={{ marginBottom: 12 }}>
              <div className="small" style={{ marginBottom: 6 }}>
                {article.sourceName}
                {article.publishedAt ? (
                  <span className="small"> • {new Date(article.publishedAt).toLocaleDateString()}</span>
                ) : null}
              </div>

              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 18,
                  fontWeight: 650,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {article.title}
              </a>

              <p className="small" style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.45 }}>
                {text}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export { BriefResults };
import { useEffect, useState } from "react";
import type { Article } from "@/lib/types";
import { isBookmarked, toggleBookmark } from "@/lib/bookmark";
import { isRead, markAsRead } from "@/lib/history";

type BriefResultsProps = {
  articles: Article[];
};

const BriefResults = ({ articles }: BriefResultsProps) => {
  const [bookmarkLinks, setBookmarkLinks] = useState<Set<string>>(new Set());
  const [readLinks, setReadLinks] = useState<Set<string>>(new Set());

  useEffect(() => {
    setBookmarkLinks(new Set());
    setReadLinks(new Set());

    const bookmarks = new Set<string>();
    const readArticles = new Set<string>();
    for (const article of articles) {
      const { link } = article;
      if (isBookmarked(link)) {
        bookmarks.add(link);
      }
      if (isRead(link)) {
        readArticles.add(link)
      }
    }
    setBookmarkLinks(bookmarks);
    setReadLinks(readArticles);
  }, [articles]);

  if (!articles.length) {
    return (
      <div className='card' style={{ marginTop: 24 }}>
        <p className='small'>No articles yet - generate a brief above.</p>
      </div>
    );
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Your Brief</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {articles.map((article, idx) => {
          const text = article.summary ?? article.description ?? "No summary available.";
          const bookmarked = bookmarkLinks.has(article.link);
          const read = readLinks.has(article.link);

          return (
            <li key={idx} className="card" style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div className="small" style={{ marginBottom: 6 }}>
                  {article.sourceName}
                  {article.publishedAt ? (
                    <span className="small"> • {new Date(article.publishedAt).toLocaleDateString()}</span>
                  ) : null}
                  {read ? (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "2xp 8px",
                        borderRadius: 999,
                        border: "1px solid var(--border)",
                        fontSize: 11,
                      }}
                    >
                      Read
                    </span>
                  ) : null}
                </div>
                <button
                  onClick={() => {
                    const next = toggleBookmark(article);
                    setBookmarkLinks(new Set(next.map(b => b.link)));
                  }}
                  title={bookmarked ? "Remove bookmark" : "Save to bookmarks"}
                  style={{
                    border: "1px solid var(--border)",
                    background: "transparent",
                    borderRadius: 10,
                    padding: "4px 8px",
                    cursor: "pointer",
                    color: "var(--text)",
                    flexShrink: 0,
                  }}
                >
                  {bookmarked ? "★" : "☆"}
                </button>
              </div>

              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const next = markAsRead(article);
                  setReadLinks(new Set(next.map(h => h.link)));
                }}
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
import { useEffect, useState } from "react";
import type { Article } from "@/lib/types";
import { isBookmarked } from "@/lib/bookmark";
import { isRead } from "@/lib/history";
import { getArticleFeedback } from "@/lib/preferences";
import { ArticleFeedback } from "@/components/ArticleFeedback";
import { ArticleMetaData } from "@/components/ArticleMetaData";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ArticleContent } from "@/components/ArticleContent";

type BriefResultsProps = {
  articles: Article[];
};

const BriefResults = ({ articles }: BriefResultsProps) => {
  const [bookmarkLinks, setBookmarkLinks] = useState<Set<string>>(new Set());
  const [readLinks, setReadLinks] = useState<Set<string>>(new Set());
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down" | undefined>>({});

  useEffect(() => {
    const bookmarks = new Set<string>();
    const readArticles = new Set<string>();
    const feedback: Record<string, "up" | "down" | undefined> = {};

    for (const article of articles) {
      const { link } = article;
      if (isBookmarked(link)) bookmarks.add(link);
      if (isRead(link)) readArticles.add(link);
      feedback[link] = getArticleFeedback(link);
    }

    setBookmarkLinks(bookmarks);
    setReadLinks(readArticles);
    setFeedbackMap(feedback);
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
          const descriptionText = article.summary ?? article.description ?? "No summary available.";
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
                  <ArticleMetaData
                    sourceName={article.sourceName}
                    publishedAt={article.publishedAt}
                    read={read}
                  />

                  <ArticleFeedback
                    article={article}
                    value={feedbackMap[article.link]}
                    onChange={next => {
                      setFeedbackMap(prev => ({
                        ...prev,
                        [article.link]: next
                      }));
                    }}
                  />
                </div>

                <BookmarkButton
                  article={article}
                  bookmarked={bookmarked}
                  onChange={links => setBookmarkLinks(links)}
                />
              </div>

              <ArticleContent
                article={article}
                descriptionText={descriptionText}
                onRead={links => setReadLinks(links)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export { BriefResults };
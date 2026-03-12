"use client";

import type { Article } from "@/lib/types";
import { markAsRead } from "@/lib/history";
import { applyArticleSignal } from "@/lib/preferences";

type ArticleContentProps = {
  article: Article;
  descriptionText: string;
  onRead: (links: Set<string>) => void;
};

const ArticleContent = ({ article, descriptionText, onRead }: ArticleContentProps) => {
  const handleClick = () => {
    const next = markAsRead(article);

    applyArticleSignal(article, "weak");
    onRead(new Set(next.map(h => h.link)));
  };

  return (
    <>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        style={{
          fontSize: 18,
          fontWeight: 650,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {article.title}
      </a>

      <p
        className="small"
        style={{
          marginTop: 10,
          marginBottom: 0,
          lineHeight: 1.45,
        }}
      >
        {descriptionText}
      </p>
    </>
  );
};

export { ArticleContent };
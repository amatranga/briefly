"use client";

type ArticleMetaDataProps = {
  sourceName: string;
  publishedAt?: string | null;
  read?: boolean;
};

const ArticleMetaData = ({ sourceName, publishedAt, read }: ArticleMetaDataProps) => (
  <>
    {sourceName}
    {publishedAt ? (
      <span className="small"> • {new Date(publishedAt).toLocaleDateString()}</span>
    ) : null}
    {read ? (
      <span
        style={{
          marginLeft: 8,
          padding: "2px 8px",
          borderRadius: 999,
          border: "1px solid var(--border)",
          fontSize: 11,
        }}
      >
        Read
      </span>
    ) : null}
  </>
);

export { ArticleMetaData };

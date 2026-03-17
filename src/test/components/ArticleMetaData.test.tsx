import { render, screen } from "@testing-library/react";
import { ArticleMetaData } from "@/components/ArticleMetaData";

describe("ArticleMetaData", () => {
  it("renders the source name", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={undefined}
        read={false}
      />
    );

    expect(screen.getByText("Example Source")).toBeInTheDocument();
  });

  it("renders the published date when provided", () => {
    const publishedAt = "2026-03-17T12:00:00.000Z";
    const expectedDate = new Date(publishedAt).toLocaleDateString();

    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={publishedAt}
        read={false}
      />
    );

    expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
  });

  it("does not render a published date when not provided", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={undefined}
        read={false}
      />
    );

    expect(screen.getByText("Example Source")).toBeInTheDocument();
    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });

  it("does not render a published date when publishedAt is null", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={null}
        read={false}
      />
    );

    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });

  it("renders the Read badge when read is true", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={undefined}
        read
      />
    );

    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("does not render the Read badge when read is false", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={undefined}
        read={false}
      />
    );

    expect(screen.queryByText("Read")).not.toBeInTheDocument();
  });

  it("does not render the Read badge when read is omitted", () => {
    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={undefined}
      />
    );

    expect(screen.queryByText("Read")).not.toBeInTheDocument();
  });

  it("renders source name, date, and Read badge together", () => {
    const publishedAt = "2026-03-17T12:00:00.000Z";
    const expectedDate = new Date(publishedAt).toLocaleDateString();

    render(
      <ArticleMetaData
        sourceName="Example Source"
        publishedAt={publishedAt}
        read
      />
    );

    expect(screen.getByText("Example Source")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });
});

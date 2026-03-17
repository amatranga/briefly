import {
  getBriefs,
  saveBriefSnapshot,
  removeBrief,
  clearBriefs
} from "@/lib/brief";

describe("brief snapshots", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses default values when cache and errors are omitted", () => {
    const result = saveBriefSnapshot({
      topics: ["tech"],
      limit: 5,
      items: [],
    });

    expect(result[0].cache).toBeNull();
    expect(result[0].errors).toEqual([]);
  });

  it("saves a brief snapshot", () => {
    const result = saveBriefSnapshot({
    topics: ["tech"],
    limit: 5,
    items: [
      {
        title: "AI startup raises funding",
        link: "https://example.com/a",
        sourceName: "TechCrunch",
        description: "desc",
        summary: "summary",
        publishedAt: "2026-01-01",
        sourceId: "sourceId",
      },
    ],
    cache: "miss",
    errors: [],
  });

  expect(result).toHaveLength(1);
  expect(getBriefs()).toHaveLength(1);
  expect(getBriefs()[0].topics).toEqual(["tech"]);
  expect(getBriefs()[0].limit).toBe(5);
  });

  it("caps history at 20 briefs", () => {
    for (let i = 0; i < 25; i++) {
      saveBriefSnapshot({
        topics: ["tech"],
        limit: 5,
        items: [],
        cache: "miss",
        errors: [],
      });
    }

    expect(getBriefs()).toHaveLength(20);
  });

  it("removes a brief by id", () => {
    const first = saveBriefSnapshot({
      topics: ["tech"],
      limit: 5,
      items: [],
      cache: "miss",
      errors: [],
    })[0];

    const second = saveBriefSnapshot({
      topics: ["business"],
      limit: 3,
      items: [],
      cache: "hit",
      errors: [],
    })[0];

    expect(getBriefs()).toHaveLength(2);

    const updated = removeBrief(first.id);

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(second.id);
    expect(getBriefs()).toHaveLength(1);
    expect(getBriefs()[0].id).toBe(second.id);
  });

  it("does nothing if removeBrief is called with an unknown id", () => {
    saveBriefSnapshot({
      topics: ["tech"],
      limit: 5,
      items: [],
      cache: "miss",
      errors: [],
    });

    const before = getBriefs();
    const updated = removeBrief("not-a-real-id");

    expect(updated).toHaveLength(1);
    expect(updated).toEqual(before);
    expect(getBriefs()).toEqual(before);
  });

  it("clears all briefs", () => {
    saveBriefSnapshot({
      topics: ["tech"],
      limit: 5,
      items: [],
      cache: "miss",
      errors: [],
    });

    saveBriefSnapshot({
      topics: ["business"],
      limit: 3,
      items: [],
      cache: "hit",
      errors: [],
    });

    expect(getBriefs()).toHaveLength(2);

    clearBriefs();

    expect(getBriefs()).toHaveLength(0);
    expect(getBriefs()).toEqual([]);
  });

  it("clearBriefs is safe to call when no briefs exist", () => {
    expect(getBriefs()).toEqual([]);

    clearBriefs();

    expect(getBriefs()).toEqual([]);
  });
});

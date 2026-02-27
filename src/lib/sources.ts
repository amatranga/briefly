const TOPICS = [
  "business",
  "tech",
  "markets",
  "sports",
  "entertainment",
] as const;

type Topic = typeof TOPICS[number];

type RssSource = {
  id: string;
  name: string;
  url: string;
  topics: Topic[];
};

const SOURCES: RssSource[] = [
  { id: "morningbrew", name: "Morning Brew", url: "https://www.morningbrew.com/feed", topics: ["business"] },
  { id: "techcrunch", name: "Tech Crunch", url: "https://techcrunch.com/feed", topics: ["tech", "business"] },
  // More sources as needed
];

export { TOPICS, SOURCES };
export type { Topic, RssSource };

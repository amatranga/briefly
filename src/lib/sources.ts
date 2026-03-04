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
  { id: "techcrunch", name: "Tech Crunch", url: "https://techcrunch.com/feed", topics: ["tech", "business", "markets"] },
  { id: "espn", name: "ESPN", url: "https://www.espn.com/espn/rss/news", topics: ["sports"] },
  { id: "rollingstone", name: "Rolling Stone", url: "https://www.rollingstone.com/feed", topics: ["entertainment"] },
  { id: "npr-pop-culture", name: "NPR (Pop Culture)", url: "https://feeds.npr.org/1048/rss.xml", topics: ["entertainment"] },
  // More sources as needed
];

export { TOPICS, SOURCES };
export type { Topic, RssSource };

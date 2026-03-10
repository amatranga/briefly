import { RssSource, TopicWeights } from "@/lib/types";

const SOURCES: RssSource[] = [
  { id: "morningbrew", name: "Morning Brew", url: "https://www.morningbrew.com/feed", topics: ["business"] },
  { id: "techcrunch", name: "Tech Crunch", url: "https://techcrunch.com/feed", topics: ["tech", "business", "markets"] },
  { id: "espn", name: "ESPN", url: "https://www.espn.com/espn/rss/news", topics: ["sports"] },
  { id: "rollingstone", name: "Rolling Stone", url: "https://www.rollingstone.com/feed", topics: ["entertainment"] },
  { id: "npr-pop-culture", name: "NPR (Pop Culture)", url: "https://feeds.npr.org/1048/rss.xml", topics: ["entertainment"] },
  // More sources as needed
];

const DEFAULT_TOPIC_WEIGHTS: TopicWeights = {
  business: 1,
  tech: 1,
  markets: 1,
  sports: 1,
  entertainment: 1,
};

export { SOURCES, DEFAULT_TOPIC_WEIGHTS };

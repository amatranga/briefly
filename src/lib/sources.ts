export type Topic = "business" | "tech" | "markets" | "sports" | "entertainment";

export type RssSource = {
  id: string;
  name: string;
  url: string;
  topics: Topic[];
};

export const SOURCES: RssSource[] = [
  { id: "morningbrew", name: "Morning Brew", url: "https://www.morningbrew.com/feed", topics: ["business"] },
  { id: "techcrunch", name: "Tech Crunch", url: "https://techcrunch.com/feed", topics: ["tech", "business"] },
  // More sources as needed
];

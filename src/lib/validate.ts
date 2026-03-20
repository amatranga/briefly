import { z } from "zod";
import { TOPICS } from "@/lib/types";

const TopicEnum = z.enum(TOPICS);

const topicWeights = z
    .object({
      business: z.number().int().min(1).max(5),
      tech: z.number().int().min(1).max(5),
      markets: z.number().int().min(1).max(5),
      sports: z.number().int().min(1).max(5),
      entertainment: z.number().int().min(1).max(5),
    })
    .optional();

const userPreferences = z
    .object({
      topicAffinity: z.object({
        business: z.number(),
        tech: z.number(),
        markets: z.number(),
        sports: z.number(),
        entertainment: z.number(),
      }),
      keywordAffinity: z.record(z.string(), z.number()),
      articleFeedback: z.record(z.string(), z.enum(["up", "down"])),
    })
    .optional();

const limit = z.number().int().min(1).max(10).default(5);

const BriefRequestSchema = z.object({
  topics: z.array(TopicEnum).min(1).max(5),
  limit,
  force: z.boolean().optional().default(false),
  topicWeights,
  userPreferences,
});

const FeedRequestSchema = z.object({
  topics: z.array(TopicEnum).min(1),
  limit,
  offset: z.number().int().min(0).optional().default(0),
  topicWeights,
  userPreferences,
});

type BriefRequest = z.infer<typeof BriefRequestSchema>;

export { BriefRequestSchema, FeedRequestSchema };
export type { BriefRequest };

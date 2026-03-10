import { z } from "zod";
import { TOPICS } from "@/lib/types";

const BriefRequestSchema = z.object({
  topics: z.array(z.enum(TOPICS)).min(1).max(5),
  limit: z.number().int().min(1).max(10).default(5),
  force: z.boolean().optional().default(false),
  topicWeights: z
    .object({
      business: z.number().int().min(1).max(5),
      tech: z.number().int().min(1).max(5),
      markets: z.number().int().min(1).max(5),
      sports: z.number().int().min(1).max(5),
      entertainment: z.number().int().min(1).max(5),
    })
    .optional(),
});

type BriefRequest = z.infer<typeof BriefRequestSchema>;

export { BriefRequestSchema };
export type { BriefRequest };

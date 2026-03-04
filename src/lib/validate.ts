import { z } from "zod";
import { TOPICS } from "@/lib/sources";

const BriefRequestSchema = z.object({
  topics: z.array(z.enum(TOPICS)).min(1).max(5),
  limit: z.number().int().min(1).max(10).default(5),
  force: z.boolean().optional().default(false),
});

type BriefRequest = z.infer<typeof BriefRequestSchema>;

export { BriefRequestSchema };
export type { BriefRequest };

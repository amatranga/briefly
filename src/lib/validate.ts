import { z } from "zod";

export const BriefRequestSchema = z.object({
  topics: z.array(z.string()).min(1).max(5),
  limit: z.number().int().min(1).max(10).default(5),
});

export type BriefRequest = z.infer<typeof BriefRequestSchema>;

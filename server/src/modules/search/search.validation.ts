import { z } from "zod";

export const searchSchema = {
  query: z.object({
    q: z.string().trim().min(1),
    limit: z.coerce.number().int().min(1).max(10).default(5),
  }),
};

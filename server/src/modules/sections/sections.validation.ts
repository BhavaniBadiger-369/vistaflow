import { z } from "zod";

export const createSectionSchema = {
  body: z.object({
    name: z.string().min(2).max(80),
    order: z.coerce.number().int().min(0).default(0),
    projectId: z.string().min(1),
  }),
};

export const sectionIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const updateSectionSchema = {
  body: z
    .object({
      name: z.string().min(2).max(80).optional(),
      order: z.coerce.number().int().min(0).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};

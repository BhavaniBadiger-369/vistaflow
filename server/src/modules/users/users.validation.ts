import { z } from "zod";

import { ROLE_OPTIONS } from "@vistaflow/shared";

export const listUsersSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
    q: z.string().trim().optional(),
    role: z.enum(ROLE_OPTIONS).optional(),
    managerId: z.string().optional(),
  }),
};

export const userIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const updateUserSchema = {
  body: z
    .object({
      name: z.string().min(2).max(60).optional(),
      role: z.enum(ROLE_OPTIONS).optional(),
      managerId: z.string().nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};

import { z } from "zod";

import { PROJECT_STATUS_OPTIONS } from "@vistaflow/shared";

export const createProjectSchema = {
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(2000).nullable().optional(),
    status: z.enum(PROJECT_STATUS_OPTIONS).default("PLANNING"),
    ownerId: z.string().optional(),
  }),
};

export const listProjectsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(9),
    q: z.string().trim().optional(),
    status: z.enum(PROJECT_STATUS_OPTIONS).optional(),
    ownerId: z.string().optional(),
  }),
};

export const projectIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const updateProjectSchema = {
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(2000).nullable().optional(),
      status: z.enum(PROJECT_STATUS_OPTIONS).optional(),
      ownerId: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};

import { z } from "zod";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@vistaflow/shared";

export const createTaskSchema = {
  body: z.object({
    title: z.string().min(2).max(140),
    description: z.string().max(4000).nullable().optional(),
    status: z.enum(TASK_STATUS_OPTIONS).default("TODO"),
    priority: z.enum(TASK_PRIORITY_OPTIONS).default("MEDIUM"),
    dueDate: z.string().datetime().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
    sectionId: z.string().min(1),
  }),
};

export const listTasksSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(10),
    q: z.string().trim().optional(),
    status: z.enum(TASK_STATUS_OPTIONS).optional(),
    priority: z.enum(TASK_PRIORITY_OPTIONS).optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
};

export const taskIdSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

export const updateTaskSchema = {
  body: z
    .object({
      title: z.string().min(2).max(140).optional(),
      description: z.string().max(4000).nullable().optional(),
      status: z.enum(TASK_STATUS_OPTIONS).optional(),
      priority: z.enum(TASK_PRIORITY_OPTIONS).optional(),
      dueDate: z.string().datetime().nullable().optional(),
      assignedToId: z.string().nullable().optional(),
      sectionId: z.string().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
};

export const updateTaskStatusSchema = {
  body: z.object({
    status: z.enum(TASK_STATUS_OPTIONS),
  }),
};

export const assignTaskSchema = {
  body: z.object({
    assignedToId: z.string().nullable(),
  }),
};

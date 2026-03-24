import { z } from "zod";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@vistaflow/shared";

export const exportTasksSchema = {
  query: z.object({
    q: z.string().trim().optional(),
    status: z.enum(TASK_STATUS_OPTIONS).optional(),
    priority: z.enum(TASK_PRIORITY_OPTIONS).optional(),
    assigneeId: z.string().optional(),
    projectId: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  }),
};

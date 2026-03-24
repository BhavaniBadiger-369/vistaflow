import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { exportController } from "./export.controller.js";
import { exportTasksSchema } from "./export.validation.js";

export const exportRouter = Router();

exportRouter.use(requireAuth);

exportRouter.get(
  "/tasks.csv",
  validateRequest(exportTasksSchema),
  asyncHandler(exportController.tasksCsv),
);
exportRouter.get(
  "/tasks.xlsx",
  validateRequest(exportTasksSchema),
  asyncHandler(exportController.tasksXlsx),
);

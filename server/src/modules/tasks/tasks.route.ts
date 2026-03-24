import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { tasksController } from "./tasks.controller.js";
import {
  assignTaskSchema,
  createTaskSchema,
  listTasksSchema,
  taskIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./tasks.validation.js";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateRequest(createTaskSchema),
  asyncHandler(tasksController.create),
);
tasksRouter.get(
  "/",
  validateRequest(listTasksSchema),
  asyncHandler(tasksController.list),
);
tasksRouter.get(
  "/:id",
  validateRequest(taskIdSchema),
  asyncHandler(tasksController.getById),
);
tasksRouter.patch(
  "/:id/status",
  validateRequest(taskIdSchema),
  validateRequest(updateTaskStatusSchema),
  asyncHandler(tasksController.updateStatus),
);
tasksRouter.patch(
  "/:id/assign",
  authorize("ADMIN", "MANAGER"),
  validateRequest(taskIdSchema),
  validateRequest(assignTaskSchema),
  asyncHandler(tasksController.assign),
);
tasksRouter.patch(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(taskIdSchema),
  validateRequest(updateTaskSchema),
  asyncHandler(tasksController.update),
);
tasksRouter.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(taskIdSchema),
  asyncHandler(tasksController.remove),
);

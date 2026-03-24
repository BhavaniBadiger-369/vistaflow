import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { projectsController } from "./projects.controller.js";
import {
  createProjectSchema,
  listProjectsSchema,
  projectIdSchema,
  updateProjectSchema,
} from "./projects.validation.js";

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateRequest(createProjectSchema),
  asyncHandler(projectsController.create),
);
projectsRouter.get(
  "/",
  validateRequest(listProjectsSchema),
  asyncHandler(projectsController.list),
);
projectsRouter.get(
  "/:id",
  validateRequest(projectIdSchema),
  asyncHandler(projectsController.getById),
);
projectsRouter.patch(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(projectIdSchema),
  validateRequest(updateProjectSchema),
  asyncHandler(projectsController.update),
);
projectsRouter.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(projectIdSchema),
  asyncHandler(projectsController.remove),
);

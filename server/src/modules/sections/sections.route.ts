import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { sectionsController } from "./sections.controller.js";
import {
  createSectionSchema,
  sectionIdSchema,
  updateSectionSchema,
} from "./sections.validation.js";

export const sectionsRouter = Router();

sectionsRouter.use(requireAuth);

sectionsRouter.post(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateRequest(createSectionSchema),
  asyncHandler(sectionsController.create),
);
sectionsRouter.get(
  "/:id",
  validateRequest(sectionIdSchema),
  asyncHandler(sectionsController.getById),
);
sectionsRouter.patch(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(sectionIdSchema),
  validateRequest(updateSectionSchema),
  asyncHandler(sectionsController.update),
);
sectionsRouter.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validateRequest(sectionIdSchema),
  asyncHandler(sectionsController.remove),
);

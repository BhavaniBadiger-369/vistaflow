import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { activityController } from "./activity.controller.js";
import { listActivitySchema } from "./activity.validation.js";

export const activityRouter = Router();

activityRouter.use(requireAuth);

activityRouter.get(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateRequest(listActivitySchema),
  asyncHandler(activityController.list),
);

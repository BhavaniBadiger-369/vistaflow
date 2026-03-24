import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/admin", authorize("ADMIN"), asyncHandler(dashboardController.admin));
dashboardRouter.get(
  "/manager",
  authorize("MANAGER"),
  asyncHandler(dashboardController.manager),
);
dashboardRouter.get(
  "/member",
  authorize("MEMBER"),
  asyncHandler(dashboardController.member),
);

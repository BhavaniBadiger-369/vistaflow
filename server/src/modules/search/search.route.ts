import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { searchController } from "./search.controller.js";
import { searchSchema } from "./search.validation.js";

export const searchRouter = Router();

searchRouter.use(requireAuth);

searchRouter.get(
  "/",
  validateRequest(searchSchema),
  asyncHandler(searchController.search),
);

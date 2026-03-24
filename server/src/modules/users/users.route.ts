import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { usersController } from "./users.controller.js";
import { listUsersSchema, updateUserSchema, userIdSchema } from "./users.validation.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get(
  "/",
  authorize("ADMIN", "MANAGER"),
  validateRequest(listUsersSchema),
  asyncHandler(usersController.list),
);
usersRouter.get(
  "/:id",
  validateRequest(userIdSchema),
  asyncHandler(usersController.getById),
);
usersRouter.patch(
  "/:id",
  authorize("ADMIN"),
  validateRequest(userIdSchema),
  validateRequest(updateUserSchema),
  asyncHandler(usersController.update),
);

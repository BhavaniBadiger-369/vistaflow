import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateRequest(registerSchema),
  asyncHandler(authController.register),
);
authRouter.post(
  "/login",
  validateRequest(loginSchema),
  asyncHandler(authController.login),
);
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", requireAuth, asyncHandler(authController.logout));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));

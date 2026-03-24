import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { Role } from "@vistaflow/shared";

import { AppError } from "../utils/app-error.js";

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(StatusCodes.UNAUTHORIZED, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(StatusCodes.FORBIDDEN, "You do not have access to this resource"));
      return;
    }

    next();
  };

import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    next(new AppError(StatusCodes.UNAUTHORIZED, "Authentication required"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(StatusCodes.UNAUTHORIZED, "Session expired"));
      return;
    }

    next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid authentication token"));
  }
};

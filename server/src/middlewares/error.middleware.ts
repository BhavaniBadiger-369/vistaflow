import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Database request failed",
      details: {
        code: error.code,
        meta: error.meta,
      },
    });
    return;
  }

 
  // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //   message: "Internal server error",
  //   details: env.NODE_ENV === "development" ? error : undefined,
  // });

  console.error("🔥 FULL ERROR:", error);

res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  message: (error as any)?.message || "Internal server error",
  details: (error as any),
});
};

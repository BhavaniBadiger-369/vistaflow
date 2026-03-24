import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { AppError } from "../utils/app-error.js";

type SchemaShape = {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
};

export const validateRequest =
  (schema: SchemaShape) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body) as Request["body"];
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as Request["params"];
      }

     if (schema.query) {
  const parsedQuery = schema.query.parse(req.query);
  (req as any).validatedQuery = parsedQuery;
}

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError(400, "Validation failed", error.flatten()));
        return;
      }

      next(error);
    }
  };

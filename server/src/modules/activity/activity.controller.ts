import type { Request, Response } from "express";

import { activityService } from "./activity.service.js";

export const activityController = {
  async list(req: Request, res: Response) {
   const query = (req as any).validatedQuery || req.query;
const result = await activityService.list(req.user!, query as never);

    res.json(result);
  },
};

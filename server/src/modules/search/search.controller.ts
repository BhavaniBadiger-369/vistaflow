import type { Request, Response } from "express";

import { searchService } from "./search.service.js";

export const searchController = {
  async search(req: Request, res: Response) {
   const query = (req as any).validatedQuery || req.query;
const result = await searchService.search(req.user!, query as never);
    res.json({
      data: result,
    });
  },
};

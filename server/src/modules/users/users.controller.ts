import type { Request, Response } from "express";

import { usersService } from "./users.service.js";

export const usersController = {
  async list(req: Request, res: Response) {
    // const result = await usersService.list(req.user!, req.query as never);
    const query = (req as any).validatedQuery || req.query;
const result = await usersService.list(req.user!, query as never);

    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await usersService.getById(req.user!, id);

    res.json({
      data: result,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await usersService.update(req.user!, id, req.body);

    res.json({
      data: result,
    });
  },
};

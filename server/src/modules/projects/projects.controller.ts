import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { projectsService } from "./projects.service.js";

export const projectsController = {
  async list(req: Request, res: Response) {
  const query = (req as any).validatedQuery || req.query;
const result = await projectsService.list(req.user!, query as never);

    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await projectsService.getById(req.user!, id);

    res.json({
      data: result,
    });
  },

  async create(req: Request, res: Response) {
    const result = await projectsService.create(req.user!, req.body);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await projectsService.update(req.user!, id, req.body);

    res.json({
      data: result,
    });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    await projectsService.remove(req.user!, id);

    res.json({
      message: "Project deleted successfully",
    });
  },
};

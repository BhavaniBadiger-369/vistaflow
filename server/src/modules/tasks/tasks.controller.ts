import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { tasksService } from "./tasks.service.js";

export const tasksController = {
  async create(req: Request, res: Response) {
    const result = await tasksService.create(req.user!, req.body);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  },

  async list(req: Request, res: Response) {
   const query = (req as any).validatedQuery || req.query;
const result = await tasksService.list(req.user!, query as never);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await tasksService.getById(req.user!, id);

    res.json({
      data: result,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await tasksService.update(req.user!, id, req.body);

    res.json({
      data: result,
    });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    await tasksService.remove(req.user!, id);

    res.json({
      message: "Task deleted successfully",
    });
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await tasksService.updateStatus(
      req.user!,
      id,
      req.body.status,
    );

    res.json({
      data: result,
    });
  },

  async assign(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await tasksService.assign(
      req.user!,
      id,
      req.body.assignedToId,
    );

    res.json({
      data: result,
    });
  },
};

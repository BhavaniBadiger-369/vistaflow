import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sectionsService } from "./sections.service.js";

export const sectionsController = {
  async create(req: Request, res: Response) {
    const result = await sectionsService.create(req.user!, req.body);

    res.status(StatusCodes.CREATED).json({
      data: result,
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await sectionsService.getById(req.user!, id);

    res.json({
      data: result,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const result = await sectionsService.update(req.user!, id, req.body);

    res.json({
      data: result,
    });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    await sectionsService.remove(req.user!, id);

    res.json({
      message: "Section deleted successfully",
    });
  },
};

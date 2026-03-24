import type { Request, Response } from "express";

import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async admin(req: Request, res: Response) {
    const data = await dashboardService.getAdminDashboard(req.user!);

    res.json({ data });
  },

  async manager(req: Request, res: Response) {
    const data = await dashboardService.getManagerDashboard(req.user!);

    res.json({ data });
  },

  async member(req: Request, res: Response) {
    const data = await dashboardService.getMemberDashboard(req.user!);

    res.json({ data });
  },
};

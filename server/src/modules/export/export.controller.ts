import type { Request, Response } from "express";

import { exportService } from "./export.service.js";

export const exportController = {
  async tasksCsv(req: Request, res: Response) {
  const query = (req as any).validatedQuery || req.query;
const file = await exportService.toCsv(req.user!, query as never);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="vistaflow-tasks.csv"');
    res.send(file);
  },

  async tasksXlsx(req: Request, res: Response) {
   const query = (req as any).validatedQuery || req.query;
const file = await exportService.toXlsx(req.user!, query as never);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="vistaflow-tasks.xlsx"',
    );
    res.send(file);
  },
};

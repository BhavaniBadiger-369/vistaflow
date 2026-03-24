import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { clearAuthCookies, getRefreshCookieName, setAuthCookies } from "../../utils/cookies.js";
import { authService } from "./auth.service.js";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(StatusCodes.CREATED).json({
      user: result.user,
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      user: result.user,
    });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.user!.id);
    clearAuthCookies(res);

    res.json({
      message: "Logged out successfully",
    });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.user!.id);

    res.json({
      user,
    });
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.cookies?.[getRefreshCookieName()]);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.json({
      user: result.user,
    });
  },
};

import type { Response } from "express";

import { env } from "../config/env.js";
import { durationToMilliseconds } from "./time.js";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const getRefreshCookieName = () => `${env.COOKIE_NAME}_refresh`;

export const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshToken: string,
) => {
  response.cookie(env.COOKIE_NAME, accessToken, {
    ...baseCookieOptions,
    maxAge: durationToMilliseconds(env.ACCESS_TOKEN_EXPIRES_IN),
  });

  response.cookie(getRefreshCookieName(), refreshToken, {
    ...baseCookieOptions,
    maxAge: durationToMilliseconds(env.REFRESH_TOKEN_EXPIRES_IN),
  });
};

export const clearAuthCookies = (response: Response) => {
  response.clearCookie(env.COOKIE_NAME, baseCookieOptions);
  response.clearCookie(getRefreshCookieName(), baseCookieOptions);
};

import jwt, { type SignOptions } from "jsonwebtoken";

import type { Role } from "@vistaflow/shared";

import { env } from "../config/env.js";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
};

const signToken = (
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: string,
) =>
  jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });

export const signAccessToken = (payload: AuthTokenPayload) =>
  signToken(payload, env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_EXPIRES_IN);

export const signRefreshToken = (payload: AuthTokenPayload) =>
  signToken(payload, env.JWT_REFRESH_SECRET, env.REFRESH_TOKEN_EXPIRES_IN);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthTokenPayload;

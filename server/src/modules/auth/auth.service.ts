import { createHash } from "node:crypto";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { recordActivity } from "../../utils/activity.js";
import { serializeAuthUser } from "../../utils/serializers.js";
import { env } from "../../config/env.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AuthTokenPayload,
} from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { durationToMilliseconds } from "../../utils/time.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
};

type LoginInput = {
  email: string;
  password: string;
};

const hashRefreshToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const createSessionTokens = async (payload: AuthTokenPayload) => {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.deleteMany({
    where: {
      userId: payload.sub,
    },
  });

  await prisma.refreshToken.create({
    data: {
      userId: payload.sub,
      token: hashRefreshToken(refreshToken),
      expiresAt: new Date(
        Date.now() + durationToMilliseconds(env.REFRESH_TOKEN_EXPIRES_IN),
      ),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const buildAuthPayload = (user: {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
}) => ({
  sub: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (existingUser) {
      throw new AppError(StatusCodes.CONFLICT, "Email is already registered");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: await hashPassword(input.password),
        role: input.role,
      },
    });

    const session = await createSessionTokens(buildAuthPayload(user));

    await recordActivity({
      userId: user.id,
      action: "USER_REGISTERED",
      entityType: "USER",
      entityId: user.id,
      metadata: {
        role: user.role,
      },
    });

    return {
      user: serializeAuthUser(user),
      ...session,
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const isValidPassword = await comparePassword(input.password, user.password);

    if (!isValidPassword) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const session = await createSessionTokens(buildAuthPayload(user));

    await recordActivity({
      userId: user.id,
      action: "LOGIN",
      entityType: "AUTH",
      entityId: user.id,
    });

    return {
      user: serializeAuthUser(user),
      ...session,
    };
  },

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });

    await recordActivity({
      userId,
      action: "LOGOUT",
      entityType: "AUTH",
      entityId: userId,
    });
  },

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    return serializeAuthUser(user);
  },

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token is missing");
    }

    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const existingToken = await prisma.refreshToken.findUnique({
      where: {
        token: tokenHash,
      },
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token is invalid");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "User no longer exists");
    }

    await prisma.refreshToken.delete({
      where: {
        token: tokenHash,
      },
    });

    const session = await createSessionTokens(buildAuthPayload(user));

    return {
      user: serializeAuthUser(user),
      ...session,
    };
  },
};

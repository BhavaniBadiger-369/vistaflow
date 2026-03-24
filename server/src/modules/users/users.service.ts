import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { recordActivity } from "../../utils/activity.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { isAdmin, isManager, type RequestUser } from "../../utils/permissions.js";
import {
  serializeAuthUser,
  serializeUserOption,
  userListInclude,
} from "../../utils/serializers.js";

type UserListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
  managerId?: string;
};

type UpdateUserInput = {
  name?: string;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
  managerId?: string | null;
};

const buildUserWhere = (
  currentUser: RequestUser,
  query: UserListQuery,
): Prisma.UserWhereInput => {
  const and: Prisma.UserWhereInput[] = [];

  if (query.q) {
    and.push({
      OR: [
        {
          name: {
            contains: query.q,
          },
        },
        {
          email: {
            contains: query.q,
          },
        },
      ],
    });
  }

  if (query.role) {
    and.push({
      role: query.role,
    });
  }

  if (query.managerId) {
    and.push({
      managerId: query.managerId,
    });
  }

  if (isManager(currentUser)) {
    and.push({
      OR: [{ id: currentUser.id }, { managerId: currentUser.id }],
    });
  }

  return and.length > 0 ? { AND: and } : {};
};

export const usersService = {
  async list(currentUser: RequestUser, query: UserListQuery) {
    const { page, pageSize, skip, take } = getPagination(query.page, query.pageSize);
    const where = buildUserWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: userListInclude,
        orderBy: [{ role: "asc" }, { name: "asc" }],
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: rows.map(serializeUserOption),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  },

  async getById(currentUser: RequestUser, id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: userListInclude,
    });

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    const canView =
      isAdmin(currentUser) ||
      currentUser.id === id ||
      (isManager(currentUser) && user.managerId === currentUser.id);

    if (!canView) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to this user");
    }

    return {
      ...serializeAuthUser(user),
      manager: user.manager,
      managedCount: user._count.managedUsers,
    };
  },

  async update(currentUser: RequestUser, id: string, input: UpdateUserInput) {
    if (!isAdmin(currentUser)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Only admins can update users");
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (input.managerId === id) {
      throw new AppError(StatusCodes.BAD_REQUEST, "A user cannot manage themselves");
    }

    if (input.managerId) {
      const manager = await prisma.user.findUnique({
        where: {
          id: input.managerId,
        },
      });

      if (!manager || manager.role === "MEMBER") {
        throw new AppError(StatusCodes.BAD_REQUEST, "Manager must be an admin or manager");
      }
    }

    const nextRole = input.role ?? existingUser.role;
    const nextManagerId =
      nextRole === "MEMBER" ? (input.managerId ?? existingUser.managerId) : null;

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: input.name,
        role: nextRole,
        managerId: nextManagerId,
      },
      include: userListInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: updatedUser.id,
      metadata: {
        role: updatedUser.role,
        managerId: updatedUser.managerId,
      },
    });

    return {
      ...serializeAuthUser(updatedUser),
      manager: updatedUser.manager,
      managedCount: updatedUser._count.managedUsers,
    };
  },
};

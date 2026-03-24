import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import { isAdmin, isManager, type RequestUser } from "../../utils/permissions.js";
import { activityInclude, serializeActivity } from "../../utils/serializers.js";

type ActivityQuery = {
  page: number;
  pageSize: number;
  entityType?: string;
  userId?: string;
};

const buildActivityWhere = async (
  currentUser: RequestUser,
  query: ActivityQuery,
): Promise<Prisma.ActivityLogWhereInput> => {
  const and: Prisma.ActivityLogWhereInput[] = [];

  if (query.entityType) {
    and.push({
      entityType: query.entityType,
    });
  }

  if (query.userId) {
    and.push({
      userId: query.userId,
    });
  }

  if (isAdmin(currentUser)) {
    return and.length > 0 ? { AND: and } : {};
  }

  if (!isManager(currentUser)) {
    throw new AppError(StatusCodes.FORBIDDEN, "Only admins and managers can view activity");
  }

  const managedUsers = await prisma.user.findMany({
    where: {
      managerId: currentUser.id,
    },
    select: {
      id: true,
    },
  });

  const allowedUserIds = [currentUser.id, ...managedUsers.map((user) => user.id)];

  and.push({
    userId: {
      in: allowedUserIds,
    },
  });

  return { AND: and };
};

export const activityService = {
  async list(currentUser: RequestUser, query: ActivityQuery) {
    const { page, pageSize, skip, take } = getPagination(query.page, query.pageSize);
    const where = await buildActivityWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: activityInclude,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      data: rows.map(serializeActivity),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  },
};

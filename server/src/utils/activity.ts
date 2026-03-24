import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

type ActivityInput = {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export const recordActivity = async ({
  userId,
  action,
  entityType,
  entityId = null,
  metadata,
}: ActivityInput) =>
  prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });

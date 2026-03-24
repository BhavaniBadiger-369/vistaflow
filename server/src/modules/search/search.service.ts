import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { isMember, type RequestUser } from "../../utils/permissions.js";

type SearchQuery = {
  q: string;
  limit: number;
};

const buildProjectWhere = (currentUser: RequestUser, query: SearchQuery): Prisma.ProjectWhereInput => {
  const and: Prisma.ProjectWhereInput[] = [
    {
      deletedAt: null,
    },
    {
      OR: [
        {
          name: {
            contains: query.q,
          },
        },
        {
          description: {
            contains: query.q,
          },
        },
      ],
    },
  ];

  if (currentUser.role === "MANAGER") {
    and.push({
      ownerId: currentUser.id,
    });
  }

  if (isMember(currentUser)) {
    and.push({
      tasks: {
        some: {
          assignedToId: currentUser.id,
          deletedAt: null,
        },
      },
    });
  }

  return { AND: and };
};

const buildTaskWhere = (currentUser: RequestUser, query: SearchQuery): Prisma.TaskWhereInput => {
  const and: Prisma.TaskWhereInput[] = [
    {
      deletedAt: null,
    },
    {
      OR: [
        {
          title: {
            contains: query.q,
          },
        },
        {
          description: {
            contains: query.q,
          },
        },
        {
          project: {
            name: {
              contains: query.q,
            },
          },
        },
      ],
    },
  ];

  if (currentUser.role === "MANAGER") {
    and.push({
      project: {
        ownerId: currentUser.id,
      },
    });
  }

  if (isMember(currentUser)) {
    and.push({
      assignedToId: currentUser.id,
    });
  }

  return { AND: and };
};

export const searchService = {
  async search(currentUser: RequestUser, query: SearchQuery) {
    const [projects, tasks] = await Promise.all([
      prisma.project.findMany({
        where: buildProjectWhere(currentUser, query),
        select: {
          id: true,
          name: true,
          status: true,
        },
        take: query.limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.task.findMany({
        where: buildTaskWhere(currentUser, query),
        select: {
          id: true,
          title: true,
          status: true,
          projectId: true,
        },
        take: query.limit,
        orderBy: {
          updatedAt: "desc",
        },
      }),
    ]);

    return {
      projects,
      tasks,
    };
  },
};

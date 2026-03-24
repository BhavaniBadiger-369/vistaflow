import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { recordActivity } from "../../utils/activity.js";
import { buildPaginationMeta, getPagination } from "../../utils/pagination.js";
import {
  canManageProject,
  isAdmin,
  isMember,
  type RequestUser,
} from "../../utils/permissions.js";
import {
  projectSummaryInclude,
  serializeProjectDetail,
  serializeProjectSummary,
  taskListInclude,
} from "../../utils/serializers.js";

type ProjectListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  status?: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  ownerId?: string;
};

type UpsertProjectInput = {
  name?: string;
  description?: string | null;
  status?: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  ownerId?: string;
};

const projectDetailInclude = {
  owner: true,
  createdBy: true,
  tasks: {
    where: {
      deletedAt: null,
    },
    select: {
      status: true,
    },
  },
  sections: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      tasks: {
        where: {
          deletedAt: null,
        },
        include: taskListInclude,
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      },
    },
  },
} satisfies Prisma.ProjectInclude;

const buildProjectWhere = (
  currentUser: RequestUser,
  query: ProjectListQuery,
): Prisma.ProjectWhereInput => {
  const and: Prisma.ProjectWhereInput[] = [{ deletedAt: null }];

  if (query.q) {
    and.push({
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
    });
  }

  if (query.status) {
    and.push({
      status: query.status,
    });
  }

  if (query.ownerId) {
    and.push({
      ownerId: query.ownerId,
    });
  }

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

const ensureProjectOwner = async (ownerId: string) => {
  const owner = await prisma.user.findUnique({
    where: {
      id: ownerId,
    },
  });

  if (!owner || owner.role === "MEMBER") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Project owner must be an admin or manager");
  }
};

const getProjectBase = async (id: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found");
  }

  return project;
};

const assertProjectReadAccess = async (currentUser: RequestUser, projectId: string) => {
  const project = await getProjectBase(projectId);

  if (canManageProject(currentUser, project.ownerId) || isAdmin(currentUser)) {
    return project;
  }

  if (isMember(currentUser)) {
    const taskCount = await prisma.task.count({
      where: {
        projectId,
        assignedToId: currentUser.id,
        deletedAt: null,
      },
    });

    if (taskCount > 0) {
      return project;
    }
  }

  throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to this project");
};

const assertProjectManageAccess = async (currentUser: RequestUser, projectId: string) => {
  const project = await getProjectBase(projectId);

  if (!canManageProject(currentUser, project.ownerId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to manage this project");
  }

  return project;
};

export const projectsService = {
  async list(currentUser: RequestUser, query: ProjectListQuery) {
    const { page, pageSize, skip, take } = getPagination(query.page, query.pageSize);
    const where = buildProjectWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: projectSummaryInclude,
        orderBy: [{ updatedAt: "desc" }],
        skip,
        take,
      }),
      prisma.project.count({ where }),
    ]);

    return {
      data: rows.map(serializeProjectSummary),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  },

  async getById(currentUser: RequestUser, id: string) {
    await assertProjectReadAccess(currentUser, id);

    const project = await prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: projectDetailInclude,
    });

    if (!project) {
      throw new AppError(StatusCodes.NOT_FOUND, "Project not found");
    }

    if (isMember(currentUser)) {
      project.sections = project.sections.map((section) => ({
        ...section,
        tasks: section.tasks.filter((task) => task.assignedToId === currentUser.id),
      }));
    }

    return serializeProjectDetail(project);
  },

  async create(currentUser: RequestUser, input: Required<Pick<UpsertProjectInput, "name" | "status">> & UpsertProjectInput) {
    const ownerId = currentUser.role === "MANAGER" ? currentUser.id : input.ownerId ?? currentUser.id;

    await ensureProjectOwner(ownerId);

    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        status: input.status,
        ownerId,
        createdById: currentUser.id,
      },
      include: projectSummaryInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project.id,
      metadata: {
        ownerId,
      },
    });

    return serializeProjectSummary(project);
  },

  async update(currentUser: RequestUser, id: string, input: UpsertProjectInput) {
    const existingProject = await assertProjectManageAccess(currentUser, id);
    const nextOwnerId =
      currentUser.role === "MANAGER"
        ? currentUser.id
        : input.ownerId ?? existingProject.ownerId;

    await ensureProjectOwner(nextOwnerId);

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name: input.name,
        description: input.description,
        status: input.status,
        ownerId: nextOwnerId,
      },
      include: projectSummaryInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project.id,
      metadata: {
        ownerId: project.ownerId,
      },
    });

    return serializeProjectSummary(project);
  },

  async remove(currentUser: RequestUser, id: string) {
    await assertProjectManageAccess(currentUser, id);
    const deletedAt = new Date();

    await prisma.$transaction([
      prisma.project.update({
        where: {
          id,
        },
        data: {
          deletedAt,
        },
      }),
      prisma.section.updateMany({
        where: {
          projectId: id,
          deletedAt: null,
        },
        data: {
          deletedAt,
        },
      }),
      prisma.task.updateMany({
        where: {
          projectId: id,
          deletedAt: null,
        },
        data: {
          deletedAt,
        },
      }),
    ]);

    await recordActivity({
      userId: currentUser.id,
      action: "PROJECT_DELETED",
      entityType: "PROJECT",
      entityId: id,
    });
  },

  assertProjectManageAccess,
  assertProjectReadAccess,
};

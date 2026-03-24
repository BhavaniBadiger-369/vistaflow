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
import { serializeTask, taskListInclude } from "../../utils/serializers.js";

export type TaskListQuery = {
  page: number;
  pageSize: number;
  q?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
};

type CreateTaskInput = {
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  assignedToId?: string | null;
  sectionId: string;
};

type UpdateTaskInput = Partial<CreateTaskInput>;

const getTaskPermissionBase = async (id: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      project: {
        select: {
          id: true,
          ownerId: true,
        },
      },
      section: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, "Task not found");
  }

  return task;
};

const getTaskRecord = async (id: string) => {
  const task = await prisma.task.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: taskListInclude,
  });

  if (!task) {
    throw new AppError(StatusCodes.NOT_FOUND, "Task not found");
  }

  return task;
};

const ensureAssignableUser = async (
  currentUser: RequestUser,
  assignedToId: string | null | undefined,
) => {
  if (!assignedToId) {
    return null;
  }

  const assignee = await prisma.user.findUnique({
    where: {
      id: assignedToId,
    },
  });

  if (!assignee) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Assignee not found");
  }

  if (!isAdmin(currentUser)) {
    const canAssignToUser =
      assignee.id === currentUser.id ||
      (assignee.role === "MEMBER" && assignee.managerId === currentUser.id);

    if (!canAssignToUser) {
      throw new AppError(StatusCodes.FORBIDDEN, "Managers can only assign tasks to their team");
    }
  }

  return assignee;
};

const ensureSectionAccess = async (currentUser: RequestUser, sectionId: string) => {
  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      deletedAt: null,
    },
    include: {
      project: true,
    },
  });

  if (!section || section.project.deletedAt) {
    throw new AppError(StatusCodes.NOT_FOUND, "Section not found");
  }

  if (!canManageProject(currentUser, section.project.ownerId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to this section");
  }

  return section;
};

const buildTaskWhere = (
  currentUser: RequestUser,
  query: Omit<TaskListQuery, "page" | "pageSize">,
): Prisma.TaskWhereInput => {
  const and: Prisma.TaskWhereInput[] = [{ deletedAt: null }];

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

  if (query.q) {
    and.push({
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
    });
  }

  if (query.status) {
    and.push({
      status: query.status,
    });
  }

  if (query.priority) {
    and.push({
      priority: query.priority,
    });
  }

  if (query.assigneeId) {
    and.push({
      assignedToId: query.assigneeId,
    });
  }

  if (query.projectId) {
    and.push({
      projectId: query.projectId,
    });
  }

  if (query.dateFrom || query.dateTo) {
    and.push({
      dueDate: {
        gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
        lte: query.dateTo ? new Date(query.dateTo) : undefined,
      },
    });
  }

  return { AND: and };
};

const ensureTaskReadAccess = async (currentUser: RequestUser, taskId: string) => {
  const baseTask = await getTaskPermissionBase(taskId);

  if (
    canManageProject(currentUser, baseTask.project.ownerId) ||
    baseTask.assignedToId === currentUser.id
  ) {
    return baseTask;
  }

  throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to this task");
};

const ensureTaskManageAccess = async (currentUser: RequestUser, taskId: string) => {
  const baseTask = await getTaskPermissionBase(taskId);

  if (!canManageProject(currentUser, baseTask.project.ownerId)) {
    throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to manage this task");
  }

  return baseTask;
};

export const tasksService = {
  async list(currentUser: RequestUser, query: TaskListQuery) {
    const { page, pageSize, skip, take } = getPagination(query.page, query.pageSize);
    const where = buildTaskWhere(currentUser, query);

    const [rows, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: taskListInclude,
        orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
        skip,
        take,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      data: rows.map(serializeTask),
      meta: buildPaginationMeta(total, page, pageSize),
    };
  },

  async listForExport(currentUser: RequestUser, query: Omit<TaskListQuery, "page" | "pageSize">) {
    const where = buildTaskWhere(currentUser, query);

    const rows = await prisma.task.findMany({
      where,
      include: taskListInclude,
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
    });

    return rows.map(serializeTask);
  },

  async getById(currentUser: RequestUser, id: string) {
    await ensureTaskReadAccess(currentUser, id);
    const task = await getTaskRecord(id);

    return serializeTask(task);
  },

  async create(currentUser: RequestUser, input: CreateTaskInput) {
    const section = await ensureSectionAccess(currentUser, input.sectionId);
    await ensureAssignableUser(currentUser, input.assignedToId);

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        assignedToId: input.assignedToId ?? null,
        sectionId: section.id,
        projectId: section.projectId,
        createdById: currentUser.id,
      },
      include: taskListInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: task.id,
      metadata: {
        projectId: task.projectId,
        sectionId: task.sectionId,
        assignedToId: task.assignedToId,
      },
    });

    return serializeTask(task);
  },

  async update(currentUser: RequestUser, id: string, input: UpdateTaskInput) {
    const existingTask = await ensureTaskManageAccess(currentUser, id);
    const section = input.sectionId
      ? await ensureSectionAccess(currentUser, input.sectionId)
      : null;

    await ensureAssignableUser(currentUser, input.assignedToId);

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate:
          input.dueDate === undefined
            ? undefined
            : input.dueDate
              ? new Date(input.dueDate)
              : null,
        assignedToId: input.assignedToId,
        sectionId: section?.id ?? existingTask.sectionId,
        projectId: section?.projectId ?? existingTask.project.id,
      },
      include: taskListInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "TASK_UPDATED",
      entityType: "TASK",
      entityId: task.id,
      metadata: {
        status: task.status,
        assignedToId: task.assignedToId,
      },
    });

    return serializeTask(task);
  },

  async remove(currentUser: RequestUser, id: string) {
    await ensureTaskManageAccess(currentUser, id);

    await prisma.task.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await recordActivity({
      userId: currentUser.id,
      action: "TASK_DELETED",
      entityType: "TASK",
      entityId: id,
    });
  },

  async updateStatus(
    currentUser: RequestUser,
    id: string,
    status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED",
  ) {
    const baseTask = await ensureTaskReadAccess(currentUser, id);

    if (
      isMember(currentUser) &&
      baseTask.assignedToId !== currentUser.id
    ) {
      throw new AppError(StatusCodes.FORBIDDEN, "Members can only update their own tasks");
    }

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: taskListInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "TASK_STATUS_CHANGED",
      entityType: "TASK",
      entityId: id,
      metadata: {
        status,
      },
    });

    return serializeTask(task);
  },

  async assign(currentUser: RequestUser, id: string, assignedToId: string | null) {
    await ensureTaskManageAccess(currentUser, id);
    await ensureAssignableUser(currentUser, assignedToId);

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        assignedToId,
      },
      include: taskListInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "TASK_ASSIGNED",
      entityType: "TASK",
      entityId: id,
      metadata: {
        assignedToId,
      },
    });

    return serializeTask(task);
  },
};

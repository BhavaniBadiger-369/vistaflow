import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { recordActivity } from "../../utils/activity.js";
import { canManageProject, isMember, type RequestUser } from "../../utils/permissions.js";
import { serializeTask, taskListInclude } from "../../utils/serializers.js";

type CreateSectionInput = {
  name: string;
  order: number;
  projectId: string;
};

type UpdateSectionInput = {
  name?: string;
  order?: number;
};

const sectionInclude = {
  project: true,
  tasks: {
    where: {
      deletedAt: null,
    },
    include: taskListInclude,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  },
} satisfies Prisma.SectionInclude;

const getSectionWithRelations = async (id: string) => {
  const section = await prisma.section.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: sectionInclude,
  });

  if (!section) {
    throw new AppError(StatusCodes.NOT_FOUND, "Section not found");
  }

  return section;
};

export const sectionsService = {
  async create(currentUser: RequestUser, input: CreateSectionInput) {
    const project = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new AppError(StatusCodes.NOT_FOUND, "Project not found");
    }

    if (!canManageProject(currentUser, project.ownerId)) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to manage this project");
    }

    const section = await prisma.section.create({
      data: input,
      include: sectionInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "SECTION_CREATED",
      entityType: "SECTION",
      entityId: section.id,
      metadata: {
        projectId: input.projectId,
      },
    });

    return {
      id: section.id,
      name: section.name,
      order: section.order,
      projectId: section.projectId,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
      taskCount: section.tasks.length,
      tasks: section.tasks.map(serializeTask),
    };
  },

  async getById(currentUser: RequestUser, id: string) {
    const section = await getSectionWithRelations(id);
    const canRead =
      canManageProject(currentUser, section.project.ownerId) ||
      (isMember(currentUser) &&
        section.tasks.some((task) => task.assignedToId === currentUser.id));

    if (!canRead) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to this section");
    }

    return {
      id: section.id,
      name: section.name,
      order: section.order,
      projectId: section.projectId,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
      taskCount: isMember(currentUser)
        ? section.tasks.filter((task) => task.assignedToId === currentUser.id).length
        : section.tasks.length,
      tasks: (isMember(currentUser)
        ? section.tasks.filter((task) => task.assignedToId === currentUser.id)
        : section.tasks
      ).map(serializeTask),
    };
  },

  async update(currentUser: RequestUser, id: string, input: UpdateSectionInput) {
    const existingSection = await getSectionWithRelations(id);

    if (!canManageProject(currentUser, existingSection.project.ownerId)) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to manage this section");
    }

    const section = await prisma.section.update({
      where: {
        id,
      },
      data: input,
      include: sectionInclude,
    });

    await recordActivity({
      userId: currentUser.id,
      action: "SECTION_UPDATED",
      entityType: "SECTION",
      entityId: section.id,
      metadata: {
        projectId: section.projectId,
      },
    });

    return {
      id: section.id,
      name: section.name,
      order: section.order,
      projectId: section.projectId,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
      taskCount: section.tasks.length,
      tasks: section.tasks.map(serializeTask),
    };
  },

  async remove(currentUser: RequestUser, id: string) {
    const existingSection = await getSectionWithRelations(id);

    if (!canManageProject(currentUser, existingSection.project.ownerId)) {
      throw new AppError(StatusCodes.FORBIDDEN, "You do not have access to manage this section");
    }

    const deletedAt = new Date();

    await prisma.$transaction([
      prisma.section.update({
        where: {
          id,
        },
        data: {
          deletedAt,
        },
      }),
      prisma.task.updateMany({
        where: {
          sectionId: id,
          deletedAt: null,
        },
        data: {
          deletedAt,
        },
      }),
    ]);

    await recordActivity({
      userId: currentUser.id,
      action: "SECTION_DELETED",
      entityType: "SECTION",
      entityId: id,
      metadata: {
        projectId: existingSection.projectId,
      },
    });
  },
};

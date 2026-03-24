import { TaskStatus, type Prisma, type Role, type User } from "@prisma/client";

import type {
  ActivityItem,
  AuthUser,
  ProjectDetail,
  ProjectSummary,
  SectionSummary,
  TaskSummary,
  UserOption,
} from "@vistaflow/shared";

import { calculateCompletion } from "./pagination.js";

const compactUser = (
  user: Pick<User, "id" | "name" | "email" | "role" | "managerId" | "createdAt" | "updatedAt">,
) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as Role,
  managerId: user.managerId,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});

export const serializeAuthUser = (
  user: Pick<User, "id" | "name" | "email" | "role" | "managerId" | "createdAt" | "updatedAt">,
): AuthUser => compactUser(user);

export const userListInclude = {
  manager: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      managedUsers: true,
    },
  },
} satisfies Prisma.UserInclude;

export type UserListRecord = Prisma.UserGetPayload<{
  include: typeof userListInclude;
}>;

export const serializeUserOption = (user: UserListRecord): UserOption => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as Role,
  manager: user.manager,
  managedCount: user._count.managedUsers,
});

export const projectSummaryInclude = {
  owner: true,
  createdBy: true,
  sections: {
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
    },
  },
  tasks: {
    where: {
      deletedAt: null,
    },
    select: {
      status: true,
    },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectSummaryRecord = Prisma.ProjectGetPayload<{
  include: typeof projectSummaryInclude;
}>;

export const serializeProjectSummary = (
  project: ProjectSummaryRecord,
): ProjectSummary => {
  const doneCount = project.tasks.filter(
    (task) => task.status === TaskStatus.DONE,
  ).length;

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      role: project.owner.role as Role,
    },
    createdBy: {
      id: project.createdBy.id,
      name: project.createdBy.name,
      email: project.createdBy.email,
      role: project.createdBy.role as Role,
    },
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    deletedAt: project.deletedAt?.toISOString() ?? null,
    sectionCount: project.sections.length,
    taskCount: project.tasks.length,
    completion: calculateCompletion(doneCount, project.tasks.length),
  };
};

export const taskListInclude = {
  assignedTo: true,
  createdBy: true,
  project: {
    select: {
      id: true,
      name: true,
      status: true,
    },
  },
  section: {
    select: {
      id: true,
      name: true,
      order: true,
    },
  },
} satisfies Prisma.TaskInclude;

export type TaskRecord = Prisma.TaskGetPayload<{
  include: typeof taskListInclude;
}>;

export const serializeTask = (task: TaskRecord): TaskSummary => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate?.toISOString() ?? null,
  projectId: task.projectId,
  sectionId: task.sectionId,
  assignedTo: task.assignedTo
    ? {
        id: task.assignedTo.id,
        name: task.assignedTo.name,
        email: task.assignedTo.email,
        role: task.assignedTo.role as Role,
      }
    : null,
  createdBy: {
    id: task.createdBy.id,
    name: task.createdBy.name,
    email: task.createdBy.email,
    role: task.createdBy.role as Role,
  },
  project: task.project,
  section: task.section,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

export const activityInclude = {
  user: true,
} satisfies Prisma.ActivityLogInclude;

export type ActivityRecord = Prisma.ActivityLogGetPayload<{
  include: typeof activityInclude;
}>;

export const serializeActivity = (activity: ActivityRecord): ActivityItem => ({
  id: activity.id,
  action: activity.action,
  entityType: activity.entityType,
  entityId: activity.entityId,
  metadata:
    activity.metadata && typeof activity.metadata === "object"
      ? (activity.metadata as Record<string, unknown>)
      : null,
  createdAt: activity.createdAt.toISOString(),
  user: {
    id: activity.user.id,
    name: activity.user.name,
    email: activity.user.email,
    role: activity.user.role as Role,
  },
});

type ProjectDetailRecord = Omit<ProjectSummaryRecord, "sections"> & {
  sections: Array<
    Pick<
      Prisma.SectionGetPayload<{
        include: {
          tasks: {
            include: typeof taskListInclude;
          };
        };
      }>,
      "id" | "name" | "order" | "projectId" | "createdAt" | "updatedAt" | "tasks"
    >
  >;
};

export const serializeProjectDetail = (project: ProjectDetailRecord): ProjectDetail => ({
  ...serializeProjectSummary(project),
  sections: project.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const summary: SectionSummary = {
        id: section.id,
        name: section.name,
        order: section.order,
        projectId: section.projectId,
        createdAt: section.createdAt.toISOString(),
        updatedAt: section.updatedAt.toISOString(),
        taskCount: section.tasks.length,
      };

      return {
        ...summary,
        tasks: section.tasks.map(serializeTask),
      };
    }),
});

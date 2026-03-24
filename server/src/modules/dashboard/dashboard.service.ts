import { StatusCodes } from "http-status-codes";

import { ROLE_OPTIONS, TASK_STATUS_OPTIONS } from "@vistaflow/shared";

import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { isAdmin, isManager, isMember, type RequestUser } from "../../utils/permissions.js";
import {
  activityInclude,
  projectSummaryInclude,
  serializeActivity,
  serializeProjectSummary,
  serializeTask,
  taskListInclude,
  userListInclude,
  serializeUserOption,
} from "../../utils/serializers.js";

export const dashboardService = {
  async getAdminDashboard(currentUser: RequestUser) {
    if (!isAdmin(currentUser)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Admin access required");
    }

    const [usersCount, projectsCount, tasksCount, taskGroups, userGroups, recent] =
      await Promise.all([
        prisma.user.count(),
        prisma.project.count({
          where: {
            deletedAt: null,
          },
        }),
        prisma.task.count({
          where: {
            deletedAt: null,
          },
        }),
        prisma.task.groupBy({
          by: ["status"],
          where: {
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        }),
        prisma.user.groupBy({
          by: ["role"],
          _count: {
            _all: true,
          },
        }),
        prisma.activityLog.findMany({
          take: 8,
          orderBy: {
            createdAt: "desc",
          },
          include: activityInclude,
        }),
      ]);

    return {
      totals: {
        users: usersCount,
        projects: projectsCount,
        tasks: tasksCount,
      },
      tasksByStatus: TASK_STATUS_OPTIONS.map((status) => ({
        status,
        count: taskGroups.find((entry) => entry.status === status)?._count._all ?? 0,
      })),
      usersByRole: ROLE_OPTIONS.map((role) => ({
        role,
        count: userGroups.find((entry) => entry.role === role)?._count._all ?? 0,
      })),
      recentActivity: recent.map(serializeActivity),
    };
  },

  async getManagerDashboard(currentUser: RequestUser) {
    if (!isManager(currentUser)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Manager access required");
    }

    const [projects, teamMembers, taskGroups, overdueTasks] = await Promise.all([
      prisma.project.findMany({
        where: {
          ownerId: currentUser.id,
          deletedAt: null,
        },
        include: projectSummaryInclude,
        orderBy: {
          updatedAt: "desc",
        },
      }),
      prisma.user.findMany({
        where: {
          managerId: currentUser.id,
        },
        include: userListInclude,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          deletedAt: null,
          project: {
            ownerId: currentUser.id,
          },
        },
        _count: {
          _all: true,
        },
      }),
      prisma.task.findMany({
        where: {
          deletedAt: null,
          project: {
            ownerId: currentUser.id,
          },
          dueDate: {
            lt: new Date(),
          },
          status: {
            not: "DONE",
          },
        },
        include: taskListInclude,
        orderBy: {
          dueDate: "asc",
        },
        take: 6,
      }),
    ]);

    const ownedProjects = projects.map(serializeProjectSummary);

    return {
      ownedProjects,
      teamMembers: teamMembers.map(serializeUserOption),
      assignedTasksOverview: TASK_STATUS_OPTIONS.map((status) => ({
        status,
        count: taskGroups.find((entry) => entry.status === status)?._count._all ?? 0,
      })),
      progressSummary: ownedProjects.map((project) => ({
        projectId: project.id,
        projectName: project.name,
        completion: project.completion,
      })),
      overdueTasks: overdueTasks.map(serializeTask),
    };
  },

  async getMemberDashboard(currentUser: RequestUser) {
    if (!isMember(currentUser)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Member access required");
    }

    const [personalTasks, taskGroups, upcomingTasks] = await Promise.all([
      prisma.task.findMany({
        where: {
          assignedToId: currentUser.id,
          deletedAt: null,
        },
        include: taskListInclude,
        orderBy: [{ updatedAt: "desc" }],
        take: 10,
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          assignedToId: currentUser.id,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      }),
      prisma.task.findMany({
        where: {
          assignedToId: currentUser.id,
          deletedAt: null,
          dueDate: {
            gte: new Date(),
          },
        },
        include: taskListInclude,
        orderBy: {
          dueDate: "asc",
        },
        take: 6,
      }),
    ]);

    const calendarMap = new Map<string, ReturnType<typeof serializeTask>[]>();

    upcomingTasks.forEach((task) => {
      if (!task.dueDate) {
        return;
      }

      const key = task.dueDate.toISOString().slice(0, 10);
      const nextTasks = calendarMap.get(key) ?? [];
      nextTasks.push(serializeTask(task));
      calendarMap.set(key, nextTasks);
    });

    return {
      personalTasks: personalTasks.map(serializeTask),
      tasksByStatus: TASK_STATUS_OPTIONS.map((status) => ({
        status,
        count: taskGroups.find((entry) => entry.status === status)?._count._all ?? 0,
      })),
      upcomingTasks: upcomingTasks.map(serializeTask),
      calendar: Array.from(calendarMap.entries()).map(([date, tasks]) => ({
        date,
        tasks,
      })),
    };
  },
};

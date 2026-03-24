import type { Role } from "@vistaflow/shared";

export type RequestUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export const isAdmin = (user: RequestUser) => user.role === "ADMIN";
export const isManager = (user: RequestUser) => user.role === "MANAGER";
export const isMember = (user: RequestUser) => user.role === "MEMBER";

export const canManageProject = (user: RequestUser, ownerId: string) =>
  isAdmin(user) || (isManager(user) && ownerId === user.id);

export const canManageUser = (user: RequestUser, targetId: string) =>
  isAdmin(user) || user.id === targetId;

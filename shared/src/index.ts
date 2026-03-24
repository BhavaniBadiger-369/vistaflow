export const ROLE_OPTIONS = ["ADMIN", "MANAGER", "MEMBER"] as const;
export type Role = (typeof ROLE_OPTIONS)[number];

export const PROJECT_STATUS_OPTIONS = [
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number];

export const TASK_STATUS_OPTIONS = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "BLOCKED",
] as const;
export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number];

export const TASK_PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH"] as const;
export type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  managerId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type UserOption = Pick<AuthUser, "id" | "name" | "email" | "role"> & {
  manager?: Pick<AuthUser, "id" | "name" | "email"> | null;
  managedCount?: number;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  owner: Pick<AuthUser, "id" | "name" | "email" | "role">;
  createdBy: Pick<AuthUser, "id" | "name" | "email" | "role">;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  sectionCount: number;
  taskCount: number;
  completion: number;
};

export type SectionSummary = {
  id: string;
  name: string;
  order: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
};

export type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  sectionId: string;
  assignedTo: Pick<AuthUser, "id" | "name" | "email" | "role"> | null;
  createdBy: Pick<AuthUser, "id" | "name" | "email" | "role">;
  project: Pick<ProjectSummary, "id" | "name" | "status">;
  section: Pick<SectionSummary, "id" | "name" | "order">;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & {
  sections: (SectionSummary & {
    tasks: TaskSummary[];
  })[];
};

export type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: Pick<AuthUser, "id" | "name" | "email" | "role">;
};

export type AdminDashboard = {
  totals: {
    users: number;
    projects: number;
    tasks: number;
  };
  tasksByStatus: { status: TaskStatus; count: number }[];
  usersByRole: { role: Role; count: number }[];
  recentActivity: ActivityItem[];
};

export type ManagerDashboard = {
  ownedProjects: ProjectSummary[];
  teamMembers: UserOption[];
  assignedTasksOverview: { status: TaskStatus; count: number }[];
  progressSummary: { projectId: string; projectName: string; completion: number }[];
  overdueTasks: TaskSummary[];
};

export type MemberDashboard = {
  personalTasks: TaskSummary[];
  tasksByStatus: { status: TaskStatus; count: number }[];
  upcomingTasks: TaskSummary[];
  calendar: { date: string; tasks: TaskSummary[] }[];
};

export type SearchResponse = {
  projects: Pick<ProjectSummary, "id" | "name" | "status">[];
  tasks: Pick<TaskSummary, "id" | "title" | "status" | "projectId">[];
};

export type ApiErrorPayload = {
  message: string;
  details?: unknown;
};

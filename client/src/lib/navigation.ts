import {
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Users,
} from "lucide-react";

import type { Role } from "@vistaflow/shared";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "MEMBER"],
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
    roles: ["ADMIN", "MANAGER", "MEMBER"],
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: ListChecks,
    roles: ["ADMIN", "MANAGER", "MEMBER"],
  },
  {
    href: "/users",
    label: "Team",
    icon: Users,
    roles: ["ADMIN", "MANAGER"],
  },
];

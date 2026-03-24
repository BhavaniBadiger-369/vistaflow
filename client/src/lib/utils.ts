import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNowStrict, isPast, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import type { Role } from "@vistaflow/shared";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const roleDashboardPath = (role: Role) => {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "MANAGER":
      return "/dashboard/manager";
    case "MEMBER":
      return "/dashboard/member";
    default:
      return "/dashboard";
  }
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return "No due date";
  }

  return format(parseISO(value), "MMM d, yyyy");
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return format(parseISO(value), "MMM d, yyyy 'at' h:mm a");
};

export const formatRelativeDate = (value?: string | null) => {
  if (!value) {
    return "Unscheduled";
  }

  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
};

export const getDueTone = (value?: string | null) => {
  if (!value) {
    return "neutral";
  }

  return isPast(parseISO(value)) ? "danger" : "success";
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
};

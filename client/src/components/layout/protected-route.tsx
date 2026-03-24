"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { Role } from "@vistaflow/shared";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { roleDashboardPath } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Role[];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized, loading } = useAuth();

  useEffect(() => {
    if (!initialized || loading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [allowedRoles, initialized, loading, pathname, router, user]);

  if (!initialized || loading || !user) {
    return <LoadingScreen />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <LoadingScreen />;
  }

  return children;
}

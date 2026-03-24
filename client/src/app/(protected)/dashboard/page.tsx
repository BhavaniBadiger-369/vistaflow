"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { roleDashboardPath } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardEntryPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(roleDashboardPath(user.role));
    }
  }, [router, user]);

  return <LoadingScreen />;
}

"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/admin": "Admin Dashboard",
  "/dashboard/manager": "Manager Dashboard",
  "/dashboard/member": "Member Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/users": "Team Directory",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const clear = useAuthStore((state) => state.clear);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      clear();
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Unable to sign out");
    }
  };

  return (
    <header className="mb-6 flex flex-col gap-4 lg:mb-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="surface-card inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
            onClick={onMenu}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
              Workspace
            </p>
            <h1 className="font-mono text-2xl font-semibold">
              {titleMap[pathname] ?? "VistaFlow"}
            </h1>
          </div>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <GlobalSearch />
        <div className="surface-card flex items-center justify-between rounded-[24px] px-4 py-3 lg:min-w-[260px]">
          <div>
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-xs text-[rgb(var(--muted))]">{user?.role}</p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Button variant="secondary" onClick={handleLogout}>
              Exit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = navigationItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[290px] flex-col gap-6 border-r border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.86)] px-5 py-6 backdrop-blur-2xl transition-transform lg:sticky lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                VistaFlow
              </p>
              <p className="text-xs text-[rgb(var(--muted))]">
                Internal delivery hub
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-2xl p-2 hover:bg-[rgba(var(--surface-alt),0.8)] lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {user ? (
          <div className="surface-card rounded-[28px] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
              Signed in as
            </p>
            <p className="mt-2 font-semibold">{user.name}</p>
            <p className="text-sm text-[rgb(var(--muted))]">{user.email}</p>
            <Badge tone="primary" className="mt-4">
              {user.role}
            </Badge>
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col gap-2">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                  active
                    ? "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]"
                    : "text-[rgb(var(--foreground))] hover:bg-[rgba(var(--surface-alt),0.82)]",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="surface-muted rounded-[26px] p-4">
          <p className="font-medium">Workflow best practice</p>
          <p className="mt-2 text-sm leading-6 text-[rgb(var(--muted))]">
            Keep projects clean by grouping work into sections and using task
            priorities sparingly.
          </p>
          <Button variant="ghost" className="mt-4 w-full">
            Review activity
          </Button>
        </div>
      </aside>
    </>
  );
}

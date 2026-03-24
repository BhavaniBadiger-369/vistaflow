import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="grid-pattern hidden overflow-hidden rounded-[34px] p-0 lg:block">
          <div className="flex h-full flex-col justify-between bg-[linear-gradient(180deg,rgba(var(--surface),0.88),rgba(var(--surface-alt),0.9))] p-8">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]">
                  <Workflow className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-mono text-sm uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
                    VistaFlow
                  </p>
                  <p className="text-xs text-[rgb(var(--muted))]">
                    Team management platform
                  </p>
                </div>
              </Link>
              <Badge tone="primary" className="rounded-full px-4 py-1.5">
                Secure internal workspace
              </Badge>
              <div>
                <h1 className="font-mono text-4xl font-semibold leading-tight">
                  Delivery visibility for admins, managers, and members.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-[rgb(var(--muted))]">
                  Access role-aware dashboards, structured project hierarchies,
                  global search, and export-ready task operations from a single,
                  production-style workspace.
                </p>
              </div>
            </div>
            <div className="surface-card rounded-[30px] p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[rgba(var(--primary),0.16)] p-2 text-[rgb(var(--primary))]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">JWT cookies + role-aware routes</p>
                  <p className="mt-1 text-sm leading-6 text-[rgb(var(--muted))]">
                    The frontend stays aligned with backend permissions instead of
                    pretending the UI is the source of truth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
        <div className="surface-card mx-auto w-full max-w-xl rounded-[34px] p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

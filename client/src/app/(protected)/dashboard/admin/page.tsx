"use client";

import { useEffect, useState } from "react";
import { ChartColumnBig, FolderKanban, ListChecks, Users } from "lucide-react";

import type { AdminDashboard } from "@vistaflow/shared";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await api.get("/dashboard/admin");

        if (active) {
          setData(response.data.data);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      {loading || !data ? (
        <LoadingScreen />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total users"
              value={data.totals.users}
              hint="Organization identities"
              icon={Users}
            />
            <StatCard
              title="Total projects"
              value={data.totals.projects}
              hint="Active non-deleted workspaces"
              icon={FolderKanban}
            />
            <StatCard
              title="Total tasks"
              value={data.totals.tasks}
              hint="Tracked operational work"
              icon={ListChecks}
            />
            <StatCard
              title="Recent activity"
              value={data.recentActivity.length}
              hint="Latest audited events"
              icon={ChartColumnBig}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Tasks by status
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Work distribution
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {data.tasksByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="surface-muted flex items-center justify-between rounded-3xl px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Current count
                      </p>
                    </div>
                    <Badge tone="primary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Users by role
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Team composition
                </h2>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {data.usersByRole.map((item) => (
                  <div
                    key={item.role}
                    className="surface-muted rounded-3xl px-4 py-5"
                  >
                    <p className="text-sm text-[rgb(var(--muted))]">{item.role}</p>
                    <p className="mt-2 font-mono text-3xl font-semibold">{item.count}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <Card className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                Recent activity
              </p>
              <h2 className="mt-2 font-mono text-2xl font-semibold">
                Audit stream
              </h2>
            </div>
            {data.recentActivity.length ? (
              <div className="space-y-3">
                {data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="surface-muted flex flex-col gap-3 rounded-3xl px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{activity.action}</p>
                      <p className="text-sm text-[rgb(var(--muted))]">
                        {activity.user.name} · {activity.entityType}
                      </p>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted))]">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="New events will appear here once the team starts using the workspace."
              />
            )}
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}

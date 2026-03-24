"use client";

import { useEffect, useState } from "react";
import { FolderKanban, ListTodo, Users, AlertTriangle } from "lucide-react";

import type { ManagerDashboard } from "@vistaflow/shared";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ManagerDashboardPage() {
  const [data, setData] = useState<ManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await api.get("/dashboard/manager");

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

  const assignedTaskCount =
    data?.assignedTasksOverview.reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      {loading || !data ? (
        <LoadingScreen />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Managed projects"
              value={data.ownedProjects.length}
              hint="Projects under your ownership"
              icon={FolderKanban}
            />
            <StatCard
              title="Team members"
              value={data.teamMembers.length}
              hint="Direct reports in your workspace"
              icon={Users}
            />
            <StatCard
              title="Assigned tasks"
              value={assignedTaskCount}
              hint="Tasks across your managed projects"
              icon={ListTodo}
            />
            <StatCard
              title="Overdue tasks"
              value={data.overdueTasks.length}
              hint="Open work requiring attention"
              icon={AlertTriangle}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Progress summary
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Project completion
                </h2>
              </div>
              <div className="space-y-3">
                {data.progressSummary.map((project) => (
                  <div
                    key={project.projectId}
                    className="surface-muted rounded-3xl px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{project.projectName}</p>
                      <Badge tone="primary">{project.completion}%</Badge>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-[rgba(var(--border),0.85)]">
                      <div
                        className="h-full rounded-full bg-[rgb(var(--primary))]"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Team roster
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Direct reports
                </h2>
              </div>
              {data.teamMembers.length ? (
                <div className="space-y-3">
                  {data.teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="surface-muted flex items-center justify-between rounded-3xl px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-[rgb(var(--muted))]">
                          {member.email}
                        </p>
                      </div>
                      <Badge>{member.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No direct reports"
                  description="Assign members to this manager to populate the team overview."
                />
              )}
            </Card>
          </section>

          <Card className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                Overdue work
              </p>
              <h2 className="mt-2 font-mono text-2xl font-semibold">
                Tasks needing escalation
              </h2>
            </div>
            {data.overdueTasks.length ? (
              <div className="space-y-3">
                {data.overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="surface-muted flex flex-col gap-3 rounded-3xl px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-[rgb(var(--muted))]">
                        {task.project.name} · {task.assignedTo?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <Badge tone="danger">{formatDate(task.dueDate)}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No overdue tasks"
                description="The team is clear of overdue work across your managed projects."
              />
            )}
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
}

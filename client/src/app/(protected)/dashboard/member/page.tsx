"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CheckSquare, Clock3, ListChecks } from "lucide-react";

import type { MemberDashboard } from "@vistaflow/shared";

import { ProtectedRoute } from "@/components/layout/protected-route";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function MemberDashboardPage() {
  const [data, setData] = useState<MemberDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await api.get("/dashboard/member");

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

  const doneCount =
    data?.tasksByStatus.find((item) => item.status === "DONE")?.count ?? 0;

  return (
    <ProtectedRoute allowedRoles={["MEMBER"]}>
      {loading || !data ? (
        <LoadingScreen />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Personal tasks"
              value={data.personalTasks.length}
              hint="Assigned work in your queue"
              icon={ListChecks}
            />
            <StatCard
              title="Done tasks"
              value={doneCount}
              hint="Completed items in this view"
              icon={CheckSquare}
            />
            <StatCard
              title="Upcoming deadlines"
              value={data.upcomingTasks.length}
              hint="Tasks with future due dates"
              icon={Clock3}
            />
            <StatCard
              title="Calendar buckets"
              value={data.calendar.length}
              hint="Dates with scheduled work"
              icon={CalendarDays}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  My tasks
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Current workload
                </h2>
              </div>
              {data.personalTasks.length ? (
                <div className="space-y-3">
                  {data.personalTasks.map((task) => (
                    <div
                      key={task.id}
                      className="surface-muted rounded-3xl px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-sm text-[rgb(var(--muted))]">
                            {task.project.name}
                          </p>
                        </div>
                        <Badge tone={task.status === "DONE" ? "success" : "primary"}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No assigned tasks"
                  description="Tasks assigned to you will appear here."
                />
              )}
            </Card>

            <Card className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
                  Upcoming schedule
                </p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">
                  Calendar view
                </h2>
              </div>
              {data.calendar.length ? (
                <div className="space-y-3">
                  {data.calendar.map((bucket) => (
                    <div
                      key={bucket.date}
                      className="surface-muted rounded-3xl px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{formatDate(bucket.date)}</p>
                        <Badge>{bucket.tasks.length} tasks</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {bucket.tasks.map((task) => (
                          <Badge key={task.id} tone="primary">
                            {task.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No upcoming due dates"
                  description="Scheduled tasks will be grouped here by due date."
                />
              )}
            </Card>
          </section>
        </div>
      )}
    </ProtectedRoute>
  );
}

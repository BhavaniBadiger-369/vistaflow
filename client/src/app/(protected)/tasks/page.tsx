"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  PaginatedResponse,
  ProjectSummary,
  Role,
  TaskSummary,
  UserOption,
} from "@vistaflow/shared";

import { TaskForm } from "@/components/forms/task-form";
import { TaskFilterBar } from "@/components/filters/task-filter-bar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Modal } from "@/components/ui/modal";
import { TasksTable } from "@/components/tables/tasks-table";
import { api } from "@/lib/api";
import { downloadBlob } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type Filters = {
  q: string;
  status: string;
  priority: string;
  assigneeId: string;
  projectId: string;
  dateFrom: string;
  dateTo: string;
};

export default function TasksPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    q: "",
    status: "",
    priority: "",
    assigneeId: "",
    projectId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [taskModal, setTaskModal] = useState<{ open: boolean; value: TaskSummary | null }>({
    open: false,
    value: null,
  });
  const debouncedQuery = useDebouncedValue(filters.q, 250);

  const requestParams = useMemo(
    () => ({
      page,
      pageSize: 10,
      q: debouncedQuery || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assigneeId: filters.assigneeId || undefined,
      projectId: filters.projectId || undefined,
      dateFrom: filters.dateFrom
        ? new Date(filters.dateFrom).toISOString()
        : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
    }),
    [debouncedQuery, filters, page],
  );

  const loadReferenceData = useCallback(async () => {
    const [projectResponse, userResponse] = await Promise.all([
      api.get<PaginatedResponse<ProjectSummary>>("/projects", {
        params: { page: 1, pageSize: 50 },
      }),
      api.get<PaginatedResponse<UserOption>>("/users", {
        params: { page: 1, pageSize: 50 },
      }).catch(
        () =>
          ({
            data: {
              data: [],
              meta: { page: 1, pageSize: 50, total: 0, pageCount: 1 },
            },
          }) as unknown as { data: PaginatedResponse<UserOption> },
      ),
    ]);

    setProjects(projectResponse.data.data);
    setUsers(userResponse.data.data);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<TaskSummary>>("/tasks", {
        params: requestParams,
      });

      setTasks(data.data);
      setPageCount(data.meta.pageCount);
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const fetchProjectSections = useCallback(async (projectId: string) => {
    if (projectId) {
      const { data } = await api.get<{ data: { sections: Array<{ id: string; name: string }> } }>(
        `/projects/${projectId}`,
      );
      return data.data.sections.map((section) => ({
        id: section.id,
        name: section.name,
      }));
    }

    const allSections: Array<{ id: string; name: string }> = [];
    for (const project of projects) {
      const { data } = await api.get<{ data: { sections: Array<{ id: string; name: string }> } }>(
        `/projects/${project.id}`,
      );
      allSections.push(...data.data.sections.map((section) => ({
        id: section.id,
        name: `${project.name} · ${section.name}`,
      })));
    }
    return allSections;
  }, [projects]);

  const [taskFormSections, setTaskFormSections] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!taskModal.open) {
      return;
    }

    const projectId = taskModal.value?.projectId ?? filters.projectId;
      void fetchProjectSections(projectId || "").then(setTaskFormSections);
  }, [fetchProjectSections, filters.projectId, taskModal.open, taskModal.value?.projectId]);

  const handleStatusChange = async (taskId: string, status: TaskSummary["status"]) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    toast.success("Task status updated");
    await loadTasks();
  };

  const handleDelete = async (task: TaskSummary) => {
    if (!window.confirm(`Delete ${task.title}?`)) {
      return;
    }

    await api.delete(`/tasks/${task.id}`);
    toast.success("Task deleted");
    await loadTasks();
  };

  const handleTaskSubmit = async (values: Parameters<typeof TaskForm>[0]["onSubmit"] extends (arg: infer A) => Promise<void> ? A : never) => {
    setSubmitting(true);
    try {
      if (taskModal.value) {
        await api.patch(`/tasks/${taskModal.value.id}`, values);
        toast.success("Task updated");
      } else {
        await api.post("/tasks", values);
        toast.success("Task created");
      }
      setTaskModal({ open: false, value: null });
      await loadTasks();
    } catch {
      toast.error("Unable to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const exportFile = async (type: "csv" | "xlsx") => {
    const response = await api.get(`/export/tasks.${type}`, {
      params: requestParams,
      responseType: "blob",
    });

    downloadBlob(response.data, `vistaflow-tasks.${type}`);
  };

  if (loading && !tasks.length) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--muted))]">
          Task operations
        </p>
        <h2 className="mt-2 font-mono text-3xl font-semibold">
          Filter, export, and update work
        </h2>
      </section>

      <TaskFilterBar
        filters={filters}
        projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        users={users}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        onExportCsv={() => void exportFile("csv")}
        onExportXlsx={() => void exportFile("xlsx")}
        onCreate={
          canManage ? () => setTaskModal({ open: true, value: null }) : undefined
        }
      />

      {tasks.length ? (
        <TasksTable
          tasks={tasks}
          role={(user?.role ?? "MEMBER") as Role}
          onEdit={canManage ? (task) => setTaskModal({ open: true, value: task }) : undefined}
          onDelete={canManage ? handleDelete : undefined}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <EmptyState
          title="No tasks match the current filters"
          description="Adjust the filters or create a new task."
        />
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          disabled={page === pageCount}
          onClick={() => setPage((current) => Math.min(current + 1, pageCount))}
        >
          Next
        </Button>
      </div>

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, value: null })}
        title={taskModal.value ? "Edit task" : "Create task"}
      >
        <TaskForm
          initialValues={taskModal.value}
          sections={taskFormSections}
          users={users}
          onSubmit={handleTaskSubmit}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
